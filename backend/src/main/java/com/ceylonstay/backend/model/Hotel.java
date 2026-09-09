package com.ceylonstay.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "hotels")
public class Hotel {
    @Id
    private String id;

    private String ownerId;

    private String name;
    private String description;
    private String propertyType; // Hotel, Villa, Resort, Guesthouse, Boutique, Apartment

    private String district;   // e.g. Galle, Kandy, Colombo
    private String city;
    private String address;

    private GeoPoint location;

    @Builder.Default
    private int starRating = 3;

    @Builder.Default
    private double averageRating = 0.0;

    @Builder.Default
    private int reviewCount = 0;

    @Builder.Default
    private List<String> facilities = new ArrayList<>(); // e.g. Free WiFi, Pool, Parking...

    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Builder.Default
    private double lowestPrice = 0.0; // cached from rooms, for search/sort

    @Builder.Default
    private HotelStatus status = HotelStatus.PENDING;

    private String checkInTime;
    private String checkOutTime;
    private String cancellationPolicy;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;
}
