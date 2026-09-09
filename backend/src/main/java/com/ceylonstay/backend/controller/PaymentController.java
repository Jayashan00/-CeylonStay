package com.ceylonstay.backend.controller;

import com.ceylonstay.backend.dto.PaymentRequest;
import com.ceylonstay.backend.model.Hotel;
import com.ceylonstay.backend.model.Payment;
import com.ceylonstay.backend.model.Role;
import com.ceylonstay.backend.security.UserPrincipal;
import com.ceylonstay.backend.service.BookingService;
import com.ceylonstay.backend.service.HotelService;
import com.ceylonstay.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final BookingService bookingService;
    private final HotelService hotelService;

    private boolean isAdmin(UserPrincipal p) {
        return p.getUser().getRole() == Role.ADMIN;
    }

    @GetMapping("/api/owner/bookings/{bookingId}/payments")
    public List<Payment> paymentsForBooking(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String bookingId) {
        return paymentService.getPaymentsForBooking(bookingId, principal.getId(), isAdmin(principal));
    }

    @PostMapping("/api/owner/bookings/{bookingId}/payments")
    public Payment addPayment(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String bookingId,
                              @Valid @RequestBody PaymentRequest request) {
        return paymentService.addPayment(bookingId, principal.getId(), principal.getUser().getFullName(), isAdmin(principal), request);
    }

    @DeleteMapping("/api/owner/payments/{paymentId}")
    public void deletePayment(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String paymentId) {
        paymentService.deletePayment(paymentId, principal.getId(), isAdmin(principal));
    }

    /** All payments across every hotel this owner manages — powers the owner Payments page. */
    @GetMapping("/api/owner/payments")
    public List<Payment> myPayments(@AuthenticationPrincipal UserPrincipal principal) {
        List<String> hotelIds = hotelService.getHotelsByOwner(principal.getId())
                .stream().map(Hotel::getId).collect(Collectors.toList());
        return paymentService.getPaymentsForOwnerHotels(hotelIds);
    }

    @GetMapping("/api/admin/payments")
    public List<Payment> allPayments() {
        return paymentService.getAllPayments();
    }
}
