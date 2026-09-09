package com.ceylonstay.backend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingUpdateRequest {
    private LocalDate checkIn;
    private LocalDate checkOut;
    private int adults;
    private int children;
    private int numberOfRooms;
    private String specialRequests;
}
