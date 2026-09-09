package com.ceylonstay.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;

    private String bookingReference;

    private String guestId;
    private String hotelId;
    private String roomId;

    private String hotelName;
    private String roomType;

    private LocalDate checkIn;
    private LocalDate checkOut;

    private int adults;
    private int children;
    private int numberOfRooms;

    private double pricePerNight;
    private double totalPrice;

    private String guestFullName;
    private String guestEmail;
    private String guestPhone;
    private String specialRequests;

    @Builder.Default
    private BookingStatus status = BookingStatus.CONFIRMED;

    @Builder.Default
    private double totalPaid = 0.0;

    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;
    private LocalDateTime cancelledAt;
}
