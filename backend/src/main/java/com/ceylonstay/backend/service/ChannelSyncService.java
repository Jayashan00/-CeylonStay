package com.ceylonstay.backend.service;

import com.ceylonstay.backend.dto.ExternalCalendarLinkRequest;
import com.ceylonstay.backend.exception.ApiException;
import com.ceylonstay.backend.model.BlockSource;
import com.ceylonstay.backend.model.ExternalCalendarLink;
import com.ceylonstay.backend.model.Hotel;
import com.ceylonstay.backend.model.Room;
import com.ceylonstay.backend.model.RoomBlock;
import com.ceylonstay.backend.repository.ExternalCalendarLinkRepository;
import com.ceylonstay.backend.repository.HotelRepository;
import com.ceylonstay.backend.repository.RoomBlockRepository;
import com.ceylonstay.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Pulls each connected OTA's iCal feed (Booking.com, Trip.lk, Agoda, Airbnb...)
 * and turns every booked date range in it into a RoomBlock with
 * source = EXTERNAL_SYNC. Those RoomBlocks are consumed by the exact same
 * AvailabilityService that guards real guest bookings on this site — so the
 * moment a sync runs, this site's own booking widget locks those dates and
 * shows "already booked" to guests, and BookingService hard-rejects any
 * booking attempt that slips through the UI. No separate/duplicate logic.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChannelSyncService {

    private final ExternalCalendarLinkRepository linkRepository;
    private final RoomBlockRepository roomBlockRepository;
    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;
    private final IcalService icalService;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    private Room assertOwnsRoom(String roomId, String requesterId, boolean isAdmin) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ApiException("Room not found", HttpStatus.NOT_FOUND));
        if (!isAdmin) {
            Hotel hotel = hotelRepository.findById(room.getHotelId())
                    .orElseThrow(() -> new ApiException("Hotel not found", HttpStatus.NOT_FOUND));
            if (!hotel.getOwnerId().equals(requesterId)) {
                throw new ApiException("You do not own this room", HttpStatus.FORBIDDEN);
            }
        }
        return room;
    }

    public List<ExternalCalendarLink> getLinksForRoom(String roomId, String requesterId, boolean isAdmin) {
        assertOwnsRoom(roomId, requesterId, isAdmin);
        return linkRepository.findByRoomId(roomId);
    }

    public ExternalCalendarLink addLink(String roomId, String requesterId, boolean isAdmin, ExternalCalendarLinkRequest req) {
        Room room = assertOwnsRoom(roomId, requesterId, isAdmin);

        if (!req.getIcalUrl().startsWith("http://") && !req.getIcalUrl().startsWith("https://")) {
            throw new ApiException("That doesn't look like a valid calendar link (must start with http:// or https://)", HttpStatus.BAD_REQUEST);
        }

        ExternalCalendarLink link = ExternalCalendarLink.builder()
                .roomId(roomId)
                .hotelId(room.getHotelId())
                .channelName(req.getChannelName())
                .icalUrl(req.getIcalUrl())
                .createdByUserId(requesterId)
                .build();
        link = linkRepository.save(link);

        // Sync immediately so the owner gets instant feedback instead of
        // waiting for the next scheduled run.
        syncOne(link);
        return linkRepository.findById(link.getId()).orElse(link);
    }

    public void deleteLink(String linkId, String requesterId, boolean isAdmin) {
        ExternalCalendarLink link = linkRepository.findById(linkId)
                .orElseThrow(() -> new ApiException("Calendar link not found", HttpStatus.NOT_FOUND));
        assertOwnsRoom(link.getRoomId(), requesterId, isAdmin);

        // Remove any blocks that came from this channel so the dates free back up immediately.
        List<RoomBlock> blocks = roomBlockRepository.findByRoomId(link.getRoomId()).stream()
                .filter(b -> b.getSource() == BlockSource.EXTERNAL_SYNC && link.getChannelName().equals(b.getChannelName()))
                .collect(Collectors.toList());
        roomBlockRepository.deleteAll(blocks);
        linkRepository.delete(link);
    }

    public ExternalCalendarLink syncNow(String linkId, String requesterId, boolean isAdmin) {
        ExternalCalendarLink link = linkRepository.findById(linkId)
                .orElseThrow(() -> new ApiException("Calendar link not found", HttpStatus.NOT_FOUND));
        assertOwnsRoom(link.getRoomId(), requesterId, isAdmin);
        syncOne(link);
        return linkRepository.findById(link.getId()).orElse(link);
    }

    /** Runs automatically every hour for every connected channel across every room. */
    @Scheduled(fixedRate = 60 * 60 * 1000, initialDelay = 60 * 1000)
    public void syncAll() {
        List<ExternalCalendarLink> links = linkRepository.findAll();
        for (ExternalCalendarLink link : links) {
            try {
                syncOne(link);
            } catch (Exception e) {
                log.warn("Calendar sync failed for link {} ({}): {}", link.getId(), link.getChannelName(), e.getMessage());
            }
        }
    }

    private void syncOne(ExternalCalendarLink link) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(link.getIcalUrl()))
                    .timeout(Duration.ofSeconds(20))
                    .header("User-Agent", "CeylonStay-CalendarSync/1.0")
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() / 100 != 2) {
                throw new IllegalStateException("Feed returned HTTP " + response.statusCode());
            }

            List<IcalService.ParsedEvent> events = icalService.parse(response.body());
            upsertBlocksFromFeed(link, events);

            link.setLastSyncedAt(LocalDateTime.now());
            link.setLastSyncStatus("OK");
            link.setLastSyncError(null);
            linkRepository.save(link);
        } catch (Exception e) {
            link.setLastSyncedAt(LocalDateTime.now());
            link.setLastSyncStatus("ERROR");
            link.setLastSyncError(e.getMessage());
            linkRepository.save(link);
            throw new RuntimeException(e);
        }
    }

    private void upsertBlocksFromFeed(ExternalCalendarLink link, List<IcalService.ParsedEvent> events) {
        List<RoomBlock> existing = roomBlockRepository.findByRoomId(link.getRoomId()).stream()
                .filter(b -> b.getSource() == BlockSource.EXTERNAL_SYNC && link.getChannelName().equals(b.getChannelName()))
                .collect(Collectors.toList());

        Set<String> seenUids = events.stream().map(IcalService.ParsedEvent::getUid).collect(Collectors.toSet());

        // Remove blocks for events that disappeared from the feed (cancelled on the OTA side).
        for (RoomBlock old : existing) {
            if (old.getExternalUid() != null && !seenUids.contains(old.getExternalUid())) {
                roomBlockRepository.delete(old);
            }
        }

        for (IcalService.ParsedEvent event : events) {
            RoomBlock match = existing.stream()
                    .filter(b -> event.getUid().equals(b.getExternalUid()))
                    .findFirst().orElse(null);

            if (match != null) {
                boolean changed = !match.getCheckIn().equals(event.getStart()) || !match.getCheckOut().equals(event.getEnd());
                if (changed) {
                    match.setCheckIn(event.getStart());
                    match.setCheckOut(event.getEnd());
                    roomBlockRepository.save(match);
                }
            } else {
                RoomBlock block = RoomBlock.builder()
                        .roomId(link.getRoomId())
                        .hotelId(link.getHotelId())
                        .checkIn(event.getStart())
                        .checkOut(event.getEnd())
                        .unitsBlocked(1)
                        .reason("Booked via " + link.getChannelName())
                        .source(BlockSource.EXTERNAL_SYNC)
                        .externalUid(event.getUid())
                        .channelName(link.getChannelName())
                        .createdByName(link.getChannelName() + " sync")
                        .build();
                roomBlockRepository.save(block);
            }
        }
    }
}