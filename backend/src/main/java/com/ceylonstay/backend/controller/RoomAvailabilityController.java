package com.ceylonstay.backend.controller;

import com.ceylonstay.backend.dto.AvailabilityResponse;
import com.ceylonstay.backend.dto.BlockedRange;
import com.ceylonstay.backend.model.Room;
import com.ceylonstay.backend.service.AvailabilityService;
import com.ceylonstay.backend.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Public endpoints (no login required) so the booking widget and calendar
 * can show real availability before the guest signs in or submits anything.
 */
@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomAvailabilityController {

    private final AvailabilityService availabilityService;
    private final RoomService roomService;

    @GetMapping("/{roomId}")
    public Room getRoom(@PathVariable String roomId) {
        return roomService.getRoom(roomId);
    }

    @GetMapping("/{roomId}/availability")
    public AvailabilityResponse checkAvailability(
            @PathVariable String roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(defaultValue = "1") int rooms,
            @RequestParam(required = false) String excludeBookingId
    ) {
        return availabilityService.checkAvailability(roomId, checkIn, checkOut, rooms, excludeBookingId);
    }

    @GetMapping("/{roomId}/blocked-dates")
    public List<BlockedRange> blockedDates(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "365") int daysAhead
    ) {
        return availabilityService.getBlockedRanges(roomId, daysAhead);
    }
}
