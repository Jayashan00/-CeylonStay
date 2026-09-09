package com.ceylonstay.backend.service;

import com.ceylonstay.backend.dto.HotelRequest;
import com.ceylonstay.backend.exception.ApiException;
import com.ceylonstay.backend.model.Hotel;
import com.ceylonstay.backend.model.HotelStatus;
import com.ceylonstay.backend.model.Room;
import com.ceylonstay.backend.repository.HotelRepository;
import com.ceylonstay.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;

    public List<Hotel> searchHotels(String district, String query, Double minPrice, Double maxPrice,
                                     Integer minStars, String sortBy) {
        List<Hotel> hotels = hotelRepository.findByStatus(HotelStatus.APPROVED);

        if (district != null && !district.isBlank() && !district.equalsIgnoreCase("all")) {
            hotels = hotels.stream()
                    .filter(h -> h.getDistrict() != null && h.getDistrict().equalsIgnoreCase(district))
                    .collect(Collectors.toList());
        }
        if (query != null && !query.isBlank()) {
            String q = query.toLowerCase();
            hotels = hotels.stream()
                    .filter(h -> (h.getName() != null && h.getName().toLowerCase().contains(q))
                            || (h.getCity() != null && h.getCity().toLowerCase().contains(q))
                            || (h.getDistrict() != null && h.getDistrict().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }
        if (minPrice != null) {
            hotels = hotels.stream().filter(h -> h.getLowestPrice() >= minPrice).collect(Collectors.toList());
        }
        if (maxPrice != null) {
            hotels = hotels.stream().filter(h -> h.getLowestPrice() <= maxPrice).collect(Collectors.toList());
        }
        if (minStars != null) {
            hotels = hotels.stream().filter(h -> h.getStarRating() >= minStars).collect(Collectors.toList());
        }

        if (sortBy != null) {
            switch (sortBy) {
                case "price_asc" -> hotels.sort(Comparator.comparingDouble(Hotel::getLowestPrice));
                case "price_desc" -> hotels.sort(Comparator.comparingDouble(Hotel::getLowestPrice).reversed());
                case "rating" -> hotels.sort(Comparator.comparingDouble(Hotel::getAverageRating).reversed());
                case "stars" -> hotels.sort(Comparator.comparingInt(Hotel::getStarRating).reversed());
                default -> { }
            }
        }
        return hotels;
    }

    public Hotel getHotel(String id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new ApiException("Hotel not found", HttpStatus.NOT_FOUND));
    }

    public List<Hotel> getHotelsByOwner(String ownerId) {
        return hotelRepository.findByOwnerId(ownerId);
    }

    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }

    public List<Hotel> getPendingHotels() {
        return hotelRepository.findByStatus(HotelStatus.PENDING);
    }

    public Hotel createHotel(String ownerId, HotelRequest req) {
        Hotel hotel = Hotel.builder()
                .ownerId(ownerId)
                .name(req.getName())
                .description(req.getDescription())
                .propertyType(req.getPropertyType())
                .district(req.getDistrict())
                .city(req.getCity())
                .address(req.getAddress())
                .location(req.getLocation())
                .starRating(req.getStarRating() == 0 ? 3 : req.getStarRating())
                .facilities(req.getFacilities())
                .images(req.getImages())
                .checkInTime(req.getCheckInTime() == null ? "14:00" : req.getCheckInTime())
                .checkOutTime(req.getCheckOutTime() == null ? "11:00" : req.getCheckOutTime())
                .cancellationPolicy(req.getCancellationPolicy())
                .status(HotelStatus.PENDING)
                .build();
        return hotelRepository.save(hotel);
    }

    public Hotel updateHotel(String hotelId, String requesterId, boolean isAdmin, HotelRequest req) {
        Hotel hotel = getHotel(hotelId);
        if (!isAdmin && !hotel.getOwnerId().equals(requesterId)) {
            throw new ApiException("You do not own this hotel", HttpStatus.FORBIDDEN);
        }
        hotel.setName(req.getName());
        hotel.setDescription(req.getDescription());
        hotel.setPropertyType(req.getPropertyType());
        hotel.setDistrict(req.getDistrict());
        hotel.setCity(req.getCity());
        hotel.setAddress(req.getAddress());
        hotel.setLocation(req.getLocation());
        hotel.setStarRating(req.getStarRating());
        hotel.setFacilities(req.getFacilities());
        hotel.setImages(req.getImages());
        hotel.setCheckInTime(req.getCheckInTime());
        hotel.setCheckOutTime(req.getCheckOutTime());
        hotel.setCancellationPolicy(req.getCancellationPolicy());
        hotel.setUpdatedAt(LocalDateTime.now());
        return hotelRepository.save(hotel);
    }

    public void deleteHotel(String hotelId, String requesterId, boolean isAdmin) {
        Hotel hotel = getHotel(hotelId);
        if (!isAdmin && !hotel.getOwnerId().equals(requesterId)) {
            throw new ApiException("You do not own this hotel", HttpStatus.FORBIDDEN);
        }
        roomRepository.deleteByHotelId(hotelId);
        hotelRepository.delete(hotel);
    }

    public Hotel updateStatus(String hotelId, HotelStatus status) {
        Hotel hotel = getHotel(hotelId);
        hotel.setStatus(status);
        hotel.setUpdatedAt(LocalDateTime.now());
        return hotelRepository.save(hotel);
    }

    public void recalculateLowestPrice(String hotelId) {
        Hotel hotel = getHotel(hotelId);
        List<Room> rooms = roomRepository.findByHotelId(hotelId);
        double lowest = rooms.stream()
                .filter(Room::isActive)
                .mapToDouble(Room::getPricePerNight)
                .min().orElse(0.0);
        hotel.setLowestPrice(lowest);
        hotelRepository.save(hotel);
    }
}
