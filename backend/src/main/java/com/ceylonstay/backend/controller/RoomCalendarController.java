package com.ceylonstay.backend.controller;

import com.ceylonstay.backend.dto.RoomBlockRequest;
import com.ceylonstay.backend.model.Booking;
import com.ceylonstay.backend.model.Hotel;
import com.ceylonstay.backend.model.Role;
import com.ceylonstay.backend.model.RoomBlock;
import com.ceylonstay.backend.security.UserPrincipal;
import com.ceylonstay.backend.service.BookingService;
import com.ceylonstay.backend.service.HotelService;
import com.ceylonstay.backend.service.RoomBlockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Owner-facing room calendar: lets an owner see, at a glance, every guest
 * booking AND every manual block on a room, and add/remove blocks. Every
 * block created here is immediately enforced by AvailabilityService for
 * all future guest searches and bookings — real-time, not a mock overlay.
 */
@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor
public class RoomCalendarController {

    private final RoomBlockService roomBlockService;
    private final BookingService bookingService;
    private final HotelService hotelService;

    private boolean isAdmin(UserPrincipal p) {
        return p.getUser().getRole() == Role.ADMIN;
    }

    @GetMapping("/rooms/{roomId}/bookings")
    public List<Booking> bookingsForRoom(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String roomId) {
        return bookingService.getBookingsForRoomOwnerScoped(roomId, principal.getId(), isAdmin(principal));
    }

    @GetMapping("/rooms/{roomId}/blocks")
    public List<RoomBlock> blocksForRoom(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String roomId) {
        return roomBlockService.getBlocksForRoom(roomId, principal.getId(), isAdmin(principal));
    }

    @PostMapping("/rooms/{roomId}/blocks")
    public RoomBlock createBlock(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String roomId,
                                 @Valid @RequestBody RoomBlockRequest request) {
        return roomBlockService.createBlock(roomId, principal.getId(), principal.getUser().getFullName(), isAdmin(principal), request);
    }

    @DeleteMapping("/blocks/{blockId}")
    public void deleteBlock(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String blockId) {
        roomBlockService.deleteBlock(blockId, principal.getId(), isAdmin(principal));
    }

    /** All manual blocks across every hotel this owner manages. */
    @GetMapping("/blocks")
    public List<RoomBlock> myBlocks(@AuthenticationPrincipal UserPrincipal principal) {
        List<String> hotelIds = hotelService.getHotelsByOwner(principal.getId())
                .stream().map(Hotel::getId).collect(Collectors.toList());
        return roomBlockService.getBlocksForOwnerHotels(hotelIds);
    }
}
