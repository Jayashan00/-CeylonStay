package com.ceylonstay.backend.controller;

import com.ceylonstay.backend.exception.ApiException;
import com.ceylonstay.backend.model.BlockSource;
import com.ceylonstay.backend.model.Booking;
import com.ceylonstay.backend.model.BookingStatus;
import com.ceylonstay.backend.model.Room;
import com.ceylonstay.backend.model.RoomBlock;
import com.ceylonstay.backend.repository.BookingRepository;
import com.ceylonstay.backend.repository.RoomBlockRepository;
import com.ceylonstay.backend.repository.RoomRepository;
import com.ceylonstay.backend.service.IcalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

/**
 * Public, unauthenticated feed of this room's occupied dates — this is the
 * URL an owner pastes into Booking.com / Trip.lk / Airbnb's "import calendar"
 * field so THEY find out about bookings made on this site. Security is via
 * an unguessable per-room token in the URL — the same scheme Airbnb,
 * Booking.com and Google Calendar all use for exported calendars: nobody
 * needs to log in to fetch an .ics file, but nobody can guess the URL either.
 */
@RestController
@RequiredArgsConstructor
public class IcalExportController {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final RoomBlockRepository roomBlockRepository;
    private final IcalService icalService;

    @GetMapping(value = "/api/ical/{roomId}/{token}.ics", produces = "text/calendar; charset=UTF-8")
    public ResponseEntity<String> exportCalendar(@PathVariable String roomId, @PathVariable String token) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ApiException("Room not found", HttpStatus.NOT_FOUND));

        if (room.getIcalExportToken() == null || !room.getIcalExportToken().equals(token)) {
            throw new ApiException("Invalid calendar link", HttpStatus.FORBIDDEN);
        }

        List<IcalService.ParsedEvent> events = new ArrayList<>();

        for (Booking b : bookingRepository.findByRoomId(roomId)) {
            if (b.getStatus() == BookingStatus.CANCELLED) continue;
            events.add(new IcalService.ParsedEvent(
                    "booking-" + b.getId(), b.getCheckIn(), b.getCheckOut(), "Booked (CeylonStay)"
            ));
        }

        // Only export MANUAL blocks — never re-export a block that was itself
        // pulled in from another channel, or two OTAs would end up bouncing
        // the same dates back and forth at each other forever.
        for (RoomBlock block : roomBlockRepository.findByRoomId(roomId)) {
            if (block.getSource() == BlockSource.MANUAL) {
                events.add(new IcalService.ParsedEvent(
                        "block-" + block.getId(), block.getCheckIn(), block.getCheckOut(),
                        block.getReason() != null ? block.getReason() : "Blocked"
                ));
            }
        }

        String ics = icalService.buildCalendar(room.getRoomType() + " — CeylonStay", events);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"room-" + roomId + ".ics\"")
                .contentType(MediaType.parseMediaType("text/calendar; charset=UTF-8"))
                .body(ics);
    }
}