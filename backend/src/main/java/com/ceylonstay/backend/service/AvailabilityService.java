package com.ceylonstay.backend.service;

import com.ceylonstay.backend.dto.AvailabilityResponse;
import com.ceylonstay.backend.dto.BlockedRange;
import com.ceylonstay.backend.exception.ApiException;
import com.ceylonstay.backend.model.Booking;
import com.ceylonstay.backend.model.BookingStatus;
import com.ceylonstay.backend.model.Room;
import com.ceylonstay.backend.model.RoomBlock;
import com.ceylonstay.backend.repository.BookingRepository;
import com.ceylonstay.backend.repository.RoomBlockRepository;
import com.ceylonstay.backend.repository.RoomRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * The single source of truth for "is this room actually free on these
 * dates". Every booking create/modify, every owner-created manual block,
 * and every public availability/calendar query goes through here — there
 * is exactly one code path that decides availability, so guests and owners
 * are always looking at the same real numbers, never a mock or a separate
 * "display only" calculation.
 *
 * A room has `totalUnits` identical rooms of that type. On any given day,
 * capacity is consumed by two things:
 *   1. Active (non-cancelled) guest Bookings.
 *   2. Owner-created RoomBlocks (maintenance, renovation, offline/manual
 *      bookings taken outside the platform, etc).
 * A request for N units on a date range is only valid if, for EVERY day in
 * that range, existing bookings + blocks + N does not exceed totalUnits.
 * This is computed day-by-day, not just "do the ranges overlap at all", so
 * partially-overlapping stays are handled correctly.
 */
@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final RoomBlockRepository roomBlockRepository;

    /** Internal, type-agnostic view of anything that occupies room-units over a date range. */
    @AllArgsConstructor
    private static class Occupancy {
        LocalDate checkIn;
        LocalDate checkOut;
        int units;
    }

    private static boolean isActive(Booking b) {
        return b.getStatus() != BookingStatus.CANCELLED;
    }

    private List<Occupancy> occupanciesForRoom(String roomId, String excludeBookingId) {
        List<Occupancy> result = new ArrayList<>();

        for (Booking b : bookingRepository.findByRoomId(roomId)) {
            if (!isActive(b)) continue;
            if (excludeBookingId != null && excludeBookingId.equals(b.getId())) continue;
            result.add(new Occupancy(b.getCheckIn(), b.getCheckOut(), Math.max(1, b.getNumberOfRooms())));
        }

        for (RoomBlock block : roomBlockRepository.findByRoomId(roomId)) {
            result.add(new Occupancy(block.getCheckIn(), block.getCheckOut(), Math.max(1, block.getUnitsBlocked())));
        }

        return result;
    }

    /** Units already committed on a specific day. */
    private int unitsCommittedOn(LocalDate day, List<Occupancy> occupancies) {
        int sum = 0;
        for (Occupancy o : occupancies) {
            if (!day.isBefore(o.checkIn) && day.isBefore(o.checkOut)) {
                sum += o.units;
            }
        }
        return sum;
    }

    /** Peak units committed across every day in [checkIn, checkOut). */
    private int peakCommitted(LocalDate checkIn, LocalDate checkOut, List<Occupancy> occupancies) {
        int peak = 0;
        for (LocalDate d = checkIn; d.isBefore(checkOut); d = d.plusDays(1)) {
            peak = Math.max(peak, unitsCommittedOn(d, occupancies));
        }
        return peak;
    }

    public AvailabilityResponse checkAvailability(String roomId, LocalDate checkIn, LocalDate checkOut,
                                                  int requestedUnits, String excludeBookingId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ApiException("Room not found", HttpStatus.NOT_FOUND));

        if (checkOut == null || checkIn == null || !checkOut.isAfter(checkIn)) {
            throw new ApiException("Check-out date must be after check-in date", HttpStatus.BAD_REQUEST);
        }

        List<Occupancy> occupancies = occupanciesForRoom(roomId, excludeBookingId);
        int peak = peakCommitted(checkIn, checkOut, occupancies);
        int totalUnits = Math.max(1, room.getTotalUnits());
        int unitsAvailable = Math.max(0, totalUnits - peak);
        int requested = Math.max(1, requestedUnits);
        boolean available = room.isActive() && (peak + requested) <= totalUnits;

        String message;
        if (!room.isActive()) {
            message = "This room type is currently not open for booking.";
        } else if (available) {
            message = unitsAvailable == totalUnits
                    ? "Available for your selected dates."
                    : unitsAvailable + " of " + totalUnits + " unit(s) still available for these dates.";
        } else if (unitsAvailable <= 0) {
            message = "Fully booked for the selected dates. Please try different dates.";
        } else {
            message = "Only " + unitsAvailable + " unit(s) left for these dates — not enough for your request.";
        }

        return AvailabilityResponse.builder()
                .available(available)
                .totalUnits(totalUnits)
                .unitsBooked(peak)
                .unitsAvailable(unitsAvailable)
                .message(message)
                .build();
    }

    /** Throws if the requested stay cannot be accommodated. Called from BookingService. */
    public void assertAvailable(String roomId, LocalDate checkIn, LocalDate checkOut,
                                int requestedUnits, String excludeBookingId) {
        AvailabilityResponse resp = checkAvailability(roomId, checkIn, checkOut, requestedUnits, excludeBookingId);
        if (!resp.isAvailable()) {
            throw new ApiException(resp.getMessage(), HttpStatus.CONFLICT);
        }
    }

    /**
     * Fully-booked date ranges over the next `daysAhead` days (from both
     * guest bookings and owner blocks), merged into contiguous blocks, for
     * the frontend calendar to grey out in real time.
     */
    public List<BlockedRange> getBlockedRanges(String roomId, int daysAhead) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ApiException("Room not found", HttpStatus.NOT_FOUND));

        List<Occupancy> occupancies = occupanciesForRoom(roomId, null);
        int totalUnits = Math.max(1, room.getTotalUnits());

        List<BlockedRange> ranges = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate horizon = today.plusDays(daysAhead);

        LocalDate blockStart = null;
        for (LocalDate d = today; d.isBefore(horizon); d = d.plusDays(1)) {
            boolean full = unitsCommittedOn(d, occupancies) >= totalUnits;
            if (full && blockStart == null) {
                blockStart = d;
            } else if (!full && blockStart != null) {
                ranges.add(new BlockedRange(blockStart, d));
                blockStart = null;
            }
        }
        if (blockStart != null) {
            ranges.add(new BlockedRange(blockStart, horizon));
        }
        return ranges;
    }
}
