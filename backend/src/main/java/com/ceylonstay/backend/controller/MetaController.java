package com.ceylonstay.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meta")
public class MetaController {

    @GetMapping("/districts")
    public List<Map<String, Object>> districts() {
        return List.of(
            Map.of("name", "Colombo", "lat", 6.9271, "lng", 79.8612),
            Map.of("name", "Gampaha", "lat", 7.0917, "lng", 79.9995),
            Map.of("name", "Kalutara", "lat", 6.5854, "lng", 79.9607),
            Map.of("name", "Galle", "lat", 6.0535, "lng", 80.2210),
            Map.of("name", "Matara", "lat", 5.9549, "lng", 80.5550),
            Map.of("name", "Hambantota", "lat", 6.1246, "lng", 81.1185),
            Map.of("name", "Kandy", "lat", 7.2906, "lng", 80.6337),
            Map.of("name", "Matale", "lat", 7.4675, "lng", 80.6234),
            Map.of("name", "Nuwara Eliya", "lat", 6.9497, "lng", 80.7891),
            Map.of("name", "Jaffna", "lat", 9.6615, "lng", 80.0255),
            Map.of("name", "Mannar", "lat", 8.9810, "lng", 79.9044),
            Map.of("name", "Trincomalee", "lat", 8.5874, "lng", 81.2152),
            Map.of("name", "Batticaloa", "lat", 7.7170, "lng", 81.7000),
            Map.of("name", "Ampara", "lat", 7.2975, "lng", 81.6747),
            Map.of("name", "Anuradhapura", "lat", 8.3114, "lng", 80.4037),
            Map.of("name", "Polonnaruwa", "lat", 7.9403, "lng", 81.0188),
            Map.of("name", "Badulla", "lat", 6.9934, "lng", 81.0550),
            Map.of("name", "Monaragala", "lat", 6.8714, "lng", 81.3510),
            Map.of("name", "Ratnapura", "lat", 6.6828, "lng", 80.4012),
            Map.of("name", "Kegalle", "lat", 7.2513, "lng", 80.3464),
            Map.of("name", "Puttalam", "lat", 8.0362, "lng", 79.8283),
            Map.of("name", "Kurunegala", "lat", 7.4863, "lng", 80.3647),
            Map.of("name", "Vavuniya", "lat", 8.7514, "lng", 80.4971),
            Map.of("name", "Kilinochchi", "lat", 9.3803, "lng", 80.3770),
            Map.of("name", "Mullaitivu", "lat", 9.2670, "lng", 80.8142)
        );
    }

    @GetMapping("/property-types")
    public List<String> propertyTypes() {
        return List.of("Hotel", "Resort", "Villa", "Boutique Hotel", "Guesthouse", "Apartment", "Homestay", "Eco Lodge", "Bungalow");
    }

    @GetMapping("/hotel-facilities")
    public List<String> hotelFacilities() {
        return List.of(
            "Free WiFi", "Swimming Pool", "Free Parking", "Airport Shuttle", "24-Hour Front Desk",
            "Restaurant", "Bar", "Spa & Wellness Centre", "Fitness Centre", "Room Service",
            "Air Conditioning", "Non-Smoking Rooms", "Family Rooms", "Laundry Service",
            "Ayurveda Centre", "Garden", "Terrace", "BBQ Facilities", "Conference Room",
            "Beachfront", "Bicycle Rental", "Tour Desk", "Currency Exchange", "Pet Friendly",
            "Elevator", "Karaoke", "Games Room", "Water Sports Facilities", "Diving", "Sun Deck"
        );
    }

    @GetMapping("/room-facilities")
    public List<String> roomFacilities() {
        return List.of(
            "Air Conditioning", "Flat-screen TV", "Free WiFi", "Minibar", "Private Bathroom",
            "Balcony", "Sea View", "Mountain View", "Garden View", "Hairdryer", "Safe",
            "Desk", "Wardrobe", "Tea/Coffee Maker", "Bathtub", "Hot Tub", "Sofa",
            "Soundproofing", "Ironing Facilities", "Wake-up Service", "Fan", "Kitchenette"
        );
    }
}
