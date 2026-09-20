package com.ceylonstay.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * A one-way IMPORT subscription: "pull this OTA's iCal feed for this room and
 * treat every event in it as an occupied date range." This is the standard,
 * free, no-approval-needed way small properties sync availability with
 * Booking.com, Airbnb, Trip.lk, etc. The opposite direction — this site's own
 * bookings going OUT to the OTA — is handled by IcalExportController, whose
 * URL the OTA polls on its own schedule.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "external_calendar_links")
public class ExternalCalendarLink {

    @Id
    private String id;

    private String roomId;
    private String hotelId;

    private String channelName; // "Booking.com", "Trip.lk", "Agoda"... free text label
    private String icalUrl;     // the .ics export URL copied from that OTA's extranet/dashboard

    private LocalDateTime lastSyncedAt;
    private String lastSyncStatus; // "OK" or "ERROR"
    private String lastSyncError;

    private String createdByUserId;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}