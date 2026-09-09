package com.ceylonstay.backend.controller;

import com.ceylonstay.backend.dto.HotelStatusRequest;
import com.ceylonstay.backend.model.Booking;
import com.ceylonstay.backend.model.Hotel;
import com.ceylonstay.backend.model.User;
import com.ceylonstay.backend.service.BookingService;
import com.ceylonstay.backend.service.HotelService;
import com.ceylonstay.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final HotelService hotelService;
    private final UserService userService;
    private final BookingService bookingService;

    @GetMapping("/hotels")
    public List<Hotel> allHotels() {
        return hotelService.getAllHotels();
    }

    @GetMapping("/hotels/pending")
    public List<Hotel> pendingHotels() {
        return hotelService.getPendingHotels();
    }

    @PutMapping("/hotels/{id}/status")
    public Hotel updateStatus(@PathVariable String id, @RequestBody HotelStatusRequest request) {
        return hotelService.updateStatus(id, request.getStatus());
    }

    @DeleteMapping("/hotels/{id}")
    public void deleteHotel(@PathVariable String id) {
        hotelService.deleteHotel(id, null, true);
    }

    @GetMapping("/users")
    public List<User> allUsers() {
        return userService.getAllUsers();
    }

    @PutMapping("/users/{id}/active")
    public User setActive(@PathVariable String id, @RequestBody Map<String, Boolean> body) {
        return userService.setActive(id, Boolean.TRUE.equals(body.get("active")));
    }

    @GetMapping("/bookings")
    public List<Booking> allBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        List<Hotel> hotels = hotelService.getAllHotels();
        List<User> users = userService.getAllUsers();
        List<Booking> bookings = bookingService.getAllBookings();

        double revenue = bookings.stream()
                .filter(b -> b.getStatus() != com.ceylonstay.backend.model.BookingStatus.CANCELLED)
                .mapToDouble(Booking::getTotalPrice).sum();

        return Map.of(
            "totalHotels", hotels.size(),
            "approvedHotels", hotels.stream().filter(h -> h.getStatus() == com.ceylonstay.backend.model.HotelStatus.APPROVED).count(),
            "pendingHotels", hotels.stream().filter(h -> h.getStatus() == com.ceylonstay.backend.model.HotelStatus.PENDING).count(),
            "totalUsers", users.size(),
            "totalBookings", bookings.size(),
            "totalRevenue", revenue
        );
    }
}
