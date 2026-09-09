package com.ceylonstay.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityResponse {
    private boolean available;
    private int totalUnits;
    private int unitsBooked;   // peak overlap across the requested range
    private int unitsAvailable;
    private String message;
}
