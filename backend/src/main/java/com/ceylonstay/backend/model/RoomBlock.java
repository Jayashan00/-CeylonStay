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
 * maintenance, renovation, owner's own use, any offline/manual booking taken
 * outside the platform, OR (new) a date range that came in automatically
 * from a connected OTA calendar (Booking.com, Trip.lk, Agoda, Airbnb...) via
 * ChannelSyncService. Either way it occupies units exactly like a guest
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

    // --- OTA channel sync fields (all null/default for ordinary manual blocks) ---

    /** MANUAL (default) or EXTERNAL_SYNC. */
    @Builder.Default
    private BlockSource source = BlockSource.MANUAL;

    /**
     * Only set when source == EXTERNAL_SYNC. The OTA's own event ID (from the
     * iCal feed's UID field) — used to match this exact block on the next
     * sync so we can update or remove it instead of duplicating it.
     */
    private String externalUid;

    /** Only set when source == EXTERNAL_SYNC, e.g. "Booking.com", "Trip.lk". */
    private String channelName;
}