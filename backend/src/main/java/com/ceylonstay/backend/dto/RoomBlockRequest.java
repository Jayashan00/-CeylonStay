package com.ceylonstay.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RoomBlockRequest {
    @NotNull
    private LocalDate checkIn;

    @NotNull
    private LocalDate checkOut;

    @Min(1)
    private int unitsBlocked = 1;

    private String reason;
}
