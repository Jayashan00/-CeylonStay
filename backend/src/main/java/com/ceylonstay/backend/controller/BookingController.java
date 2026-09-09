package com.ceylonstay.backend.controller;

import com.ceylonstay.backend.dto.BookingRequest;
import com.ceylonstay.backend.dto.BookingUpdateRequest;
import com.ceylonstay.backend.model.Booking;
import com.ceylonstay.backend.model.Role;
import com.ceylonstay.backend.security.UserPrincipal;
import com.ceylonstay.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public Booking create(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody BookingRequest request) {
        return bookingService.createBooking(principal.getId(), request);
    }

    @GetMapping("/my")
    public List<Booking> myBookings(@AuthenticationPrincipal UserPrincipal principal) {
        return bookingService.getGuestBookings(principal.getId());
    }

    @GetMapping("/{id}")
    public Booking getOne(@PathVariable String id) {
        return bookingService.getBooking(id);
    }

    @PutMapping("/{id}")
    public Booking modify(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id,
                           @RequestBody BookingUpdateRequest request) {
        return bookingService.modifyBooking(id, principal.getId(), request);
    }

    @PutMapping("/{id}/cancel")
    public Booking cancel(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        boolean privileged = principal.getUser().getRole() == Role.ADMIN;
        return bookingService.cancelBooking(id, principal.getId(), privileged);
    }
}
