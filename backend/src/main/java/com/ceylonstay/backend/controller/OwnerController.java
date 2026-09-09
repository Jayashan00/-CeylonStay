package com.ceylonstay.backend.controller;

import com.ceylonstay.backend.dto.HotelRequest;
import com.ceylonstay.backend.dto.RoomRequest;
import com.ceylonstay.backend.model.Booking;
import com.ceylonstay.backend.model.BookingStatus;
import com.ceylonstay.backend.model.Hotel;
import com.ceylonstay.backend.model.HotelStatus;
import com.ceylonstay.backend.model.Role;
import com.ceylonstay.backend.model.Room;
import com.ceylonstay.backend.security.UserPrincipal;
import com.ceylonstay.backend.service.BookingService;
import com.ceylonstay.backend.service.HotelService;
import com.ceylonstay.backend.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor
public class OwnerController {

    private final HotelService hotelService;
    private final RoomService roomService;
    private final BookingService bookingService;

    private boolean isAdmin(UserPrincipal p) {
        return p.getUser().getRole() == Role.ADMIN;
    }

    @GetMapping("/hotels")
    public List<Hotel> myHotels(@AuthenticationPrincipal UserPrincipal principal) {
        return hotelService.getHotelsByOwner(principal.getId());
    }

    @PostMapping("/hotels")
    public Hotel createHotel(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody HotelRequest request) {
        return hotelService.createHotel(principal.getId(), request);
    }

    @PutMapping("/hotels/{id}")
    public Hotel updateHotel(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id,
                             @Valid @RequestBody HotelRequest request) {
        return hotelService.updateHotel(id, principal.getId(), isAdmin(principal), request);
    }

    @DeleteMapping("/hotels/{id}")
    public void deleteHotel(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        hotelService.deleteHotel(id, principal.getId(), isAdmin(principal));
    }

    @PostMapping("/hotels/{hotelId}/rooms")
    public Room addRoom(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String hotelId,
                        @Valid @RequestBody RoomRequest request) {
        return roomService.addRoom(hotelId, principal.getId(), isAdmin(principal), request);
    }

    @PutMapping("/rooms/{roomId}")
    public Room updateRoom(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String roomId,
                           @Valid @RequestBody RoomRequest request) {
        return roomService.updateRoom(roomId, principal.getId(), isAdmin(principal), request);
    }

    @DeleteMapping("/rooms/{roomId}")
    public void deleteRoom(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String roomId) {
        roomService.deleteRoom(roomId, principal.getId(), isAdmin(principal));
    }

    @GetMapping("/bookings")
    public List<Booking> myHotelBookings(@AuthenticationPrincipal UserPrincipal principal) {
        List<String> hotelIds = hotelService.getHotelsByOwner(principal.getId())
                .stream().map(Hotel::getId).collect(Collectors.toList());
        return bookingService.getBookingsForOwnerHotels(hotelIds);
    }

    @PutMapping("/bookings/{id}/cancel")
    public Booking cancelBooking(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return bookingService.cancelBooking(id, principal.getId(), true);
    }

    /** Powers the Owner Dashboard overview page: headline numbers + recent activity. */
    @GetMapping("/stats")
    public Map<String, Object> myStats(@AuthenticationPrincipal UserPrincipal principal) {
        List<Hotel> hotels = hotelService.getHotelsByOwner(principal.getId());
        List<String> hotelIds = hotels.stream().map(Hotel::getId).collect(Collectors.toList());
        List<Booking> bookings = bookingService.getBookingsForOwnerHotels(hotelIds);

        List<Booking> active = bookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .collect(Collectors.toList());

        LocalDate today = LocalDate.now();
        LocalDate weekAhead = today.plusDays(7);

        List<Booking> upcomingCheckIns = active.stream()
                .filter(b -> !b.getCheckIn().isBefore(today) && b.getCheckIn().isBefore(weekAhead))
                .sorted(Comparator.comparing(Booking::getCheckIn))
                .collect(Collectors.toList());

        double totalRevenueCollected = active.stream().mapToDouble(Booking::getTotalPaid).sum();
        double totalOutstanding = active.stream()
                .mapToDouble(b -> Math.max(0, b.getTotalPrice() - b.getTotalPaid()))
                .sum();

        List<Booking> recentBookings = bookings.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt).reversed())
                .limit(8)
                .collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProperties", hotels.size());
        stats.put("approvedProperties", hotels.stream().filter(h -> h.getStatus() == HotelStatus.APPROVED).count());
        stats.put("pendingProperties", hotels.stream().filter(h -> h.getStatus() == HotelStatus.PENDING).count());
        stats.put("totalBookings", active.size());
        stats.put("upcomingCheckIns", upcomingCheckIns.size());
        stats.put("totalRevenueCollected", totalRevenueCollected);
        stats.put("totalOutstanding", totalOutstanding);
        stats.put("recentBookings", recentBookings);
        stats.put("upcomingCheckInsList", upcomingCheckIns);
        return stats;
    }
}
