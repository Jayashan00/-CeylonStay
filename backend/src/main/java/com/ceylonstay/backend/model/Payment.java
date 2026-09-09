package com.ceylonstay.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * A single payment entry against a booking (an advance, a balance
 * settlement, a full payment, or a refund). A booking can have several of
 * these over its lifetime (e.g. advance now, balance on check-in) — this is
 * a ledger, not a single status flag, so hotel owners keep a clear record
 * of exactly what was collected and when.
 *
 * No payment gateway is integrated: these records are entered manually by
 * the hotel owner (or admin) after collecting payment by cash, bank
 * transfer, card terminal, etc. outside the platform.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    private String bookingId;
    private String hotelId;   // denormalized for ownership checks & queries

    private double amount;
    private PaymentType type;
    private PaymentMethod method;

    private String reference; // optional: bank slip no., transaction id, etc.
    private String notes;

    private String recordedByUserId;
    private String recordedByName;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
