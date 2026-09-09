package com.ceylonstay.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * A hotel-owner-created "block" on a room type for a date range — used for
 * maintenance, renovation, owner's own use, or any offline/manual booking
 * taken outside the platform. It occupies units exactly like a guest
 * Booking does for availability purposes (see AvailabilityService), so
 * guests browsing the site immediately see those dates as unavailable —
 * this is not a mock overlay, it feeds the same real availability engine
 * that governs actual bookings.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "room_blocks")
public class RoomBlock {

    @Id
    private String id;

    private String roomId;
    private String hotelId;

    private LocalDate checkIn;   // inclusive
    private LocalDate checkOut;  // exclusive, same semantics as Booking

    @Builder.Default
    private int unitsBlocked = 1;

    private String reason;

    private String createdByUserId;
    private String createdByName;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
