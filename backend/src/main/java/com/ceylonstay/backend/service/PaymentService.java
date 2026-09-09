package com.ceylonstay.backend.service;

import com.ceylonstay.backend.dto.PaymentRequest;
import com.ceylonstay.backend.exception.ApiException;
import com.ceylonstay.backend.model.Booking;
import com.ceylonstay.backend.model.Hotel;
import com.ceylonstay.backend.model.Payment;
import com.ceylonstay.backend.model.PaymentType;
import com.ceylonstay.backend.repository.HotelRepository;
import com.ceylonstay.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Manual payment ledger — no payment gateway involved. A hotel owner (or
 * admin) records what was actually collected from a guest (advance, balance,
 * full amount, or a refund), and Booking.totalPaid / paymentStatus are kept
 * in sync automatically. Every operation is scoped so an owner can only see
 * or touch payments for bookings on hotels they actually own.
 */
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final HotelRepository hotelRepository;
    private final BookingService bookingService;

    private void assertOwnsHotel(String hotelId, String requesterId, boolean isAdmin) {
        if (isAdmin) return;
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ApiException("Hotel not found", HttpStatus.NOT_FOUND));
        if (!hotel.getOwnerId().equals(requesterId)) {
            throw new ApiException("You do not have access to payments for this hotel", HttpStatus.FORBIDDEN);
        }
    }

    public List<Payment> getPaymentsForBooking(String bookingId, String requesterId, boolean isAdmin) {
        Booking booking = bookingService.getBooking(bookingId);
        assertOwnsHotel(booking.getHotelId(), requesterId, isAdmin);
        return paymentRepository.findByBookingId(bookingId);
    }

    public List<Payment> getPaymentsForOwnerHotels(List<String> hotelIds) {
        return paymentRepository.findByHotelIdIn(hotelIds);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment addPayment(String bookingId, String requesterId, String requesterName, boolean isAdmin, PaymentRequest req) {
        Booking booking = bookingService.getBooking(bookingId);
        assertOwnsHotel(booking.getHotelId(), requesterId, isAdmin);

        Payment payment = Payment.builder()
                .bookingId(bookingId)
                .hotelId(booking.getHotelId())
                .amount(req.getAmount())
                .type(req.getType())
                .method(req.getMethod())
                .reference(req.getReference())
                .notes(req.getNotes())
                .recordedByUserId(requesterId)
                .recordedByName(requesterName)
                .build();

        Payment saved = paymentRepository.save(payment);
        recalculateBookingTotal(bookingId);
        return saved;
    }

    public void deletePayment(String paymentId, String requesterId, boolean isAdmin) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ApiException("Payment record not found", HttpStatus.NOT_FOUND));
        assertOwnsHotel(payment.getHotelId(), requesterId, isAdmin);
        paymentRepository.delete(payment);
        recalculateBookingTotal(payment.getBookingId());
    }

    private void recalculateBookingTotal(String bookingId) {
        List<Payment> payments = paymentRepository.findByBookingId(bookingId);
        double net = payments.stream()
                .mapToDouble(p -> p.getType() == PaymentType.REFUND ? -p.getAmount() : p.getAmount())
                .sum();
        bookingService.applyPaymentTotal(bookingId, Math.max(0, net));
    }

    /** Convenience: payments for a set of bookings, e.g. an owner's whole booking list. */
    public List<Payment> getPaymentsForBookings(List<String> bookingIds) {
        if (bookingIds.isEmpty()) return List.of();
        return paymentRepository.findByBookingIdIn(bookingIds);
    }
}
