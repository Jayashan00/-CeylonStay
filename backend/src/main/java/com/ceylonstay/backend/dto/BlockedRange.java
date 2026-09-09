package com.ceylonstay.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * A date range (inclusive of checkIn, exclusive of checkOut, matching
 * booking semantics) where the room has NO remaining units left — used by
 * the frontend calendar to grey out fully-booked dates before the guest
 * even attempts to select them.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockedRange {
    private LocalDate start;
    private LocalDate end;
}
