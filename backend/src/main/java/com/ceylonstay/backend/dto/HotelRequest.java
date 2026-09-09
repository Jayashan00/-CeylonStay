package com.ceylonstay.backend.dto;

import com.ceylonstay.backend.model.GeoPoint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class HotelRequest {
    @NotBlank
    private String name;
    private String description;
    private String propertyType;

    @NotBlank
    private String district;
    private String city;
    private String address;

    @NotNull
    private GeoPoint location;

    private int starRating;
    private List<String> facilities;
    private List<String> images;

    private String checkInTime;
    private String checkOutTime;
    private String cancellationPolicy;
}
