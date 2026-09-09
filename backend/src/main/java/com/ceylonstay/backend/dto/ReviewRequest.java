package com.ceylonstay.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotBlank
    private String hotelId;
    private String bookingId;

    @Min(1) @Max(10)
    private int rating;

    private String comment;
}
