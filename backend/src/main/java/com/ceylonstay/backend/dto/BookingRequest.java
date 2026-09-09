package com.ceylonstay.backend.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequest {
    @NotBlank
    private String hotelId;
    @NotBlank
    private String roomId;

    @NotNull
    private LocalDate checkIn;
    @NotNull
    private LocalDate checkOut;

    private int adults;
    private int children;
    private int numberOfRooms;

    @NotBlank
    private String guestFullName;
    @NotBlank
    private String guestEmail;
    private String guestPhone;
    private String specialRequests;
}
