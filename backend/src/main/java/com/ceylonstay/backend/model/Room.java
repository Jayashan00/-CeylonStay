package com.ceylonstay.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "rooms")
public class Room {
    @Id
    private String id;

    private String hotelId;

    private String roomType; // Standard, Deluxe, Suite, Family...
    private String description;

    private double pricePerNight;
    private int maxOccupancy;
    private int totalUnits; // number of rooms of this type available in hotel

    @Builder.Default
    private List<String> facilities = new ArrayList<>(); // AC, TV, Minibar, Balcony...

    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Builder.Default
    private boolean breakfastIncluded = false;

    @Builder.Default
    private boolean freeCancellation = true;

    @Builder.Default
    private boolean active = true;
}
