package com.ceylonstay.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class RoomRequest {
    @NotBlank
    private String roomType;
    private String description;

    @Positive
    private double pricePerNight;

    private int maxOccupancy;
    private int totalUnits;

    private List<String> facilities;
    private List<String> images;

    private boolean breakfastIncluded;
    private boolean freeCancellation;
}
