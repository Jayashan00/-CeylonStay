package com.ceylonstay.backend.service;

import com.ceylonstay.backend.dto.RoomRequest;
import com.ceylonstay.backend.exception.ApiException;
import com.ceylonstay.backend.model.Hotel;
import com.ceylonstay.backend.model.Room;
import com.ceylonstay.backend.repository.HotelRepository;
import com.ceylonstay.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;
    private final HotelService hotelService;

    public List<Room> getRoomsByHotel(String hotelId) {
        return roomRepository.findByHotelId(hotelId);
    }

    public Room getRoom(String id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ApiException("Room not found", HttpStatus.NOT_FOUND));
    }

    private void assertOwnership(Hotel hotel, String requesterId, boolean isAdmin) {
        if (!isAdmin && !hotel.getOwnerId().equals(requesterId)) {
            throw new ApiException("You do not own this hotel", HttpStatus.FORBIDDEN);
        }
    }

    public Room addRoom(String hotelId, String requesterId, boolean isAdmin, RoomRequest req) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ApiException("Hotel not found", HttpStatus.NOT_FOUND));
        assertOwnership(hotel, requesterId, isAdmin);

        Room room = Room.builder()
                .hotelId(hotelId)
                .roomType(req.getRoomType())
                .description(req.getDescription())
                .pricePerNight(req.getPricePerNight())
                .maxOccupancy(req.getMaxOccupancy())
                .totalUnits(req.getTotalUnits() == 0 ? 1 : req.getTotalUnits())
                .facilities(req.getFacilities())
                .images(req.getImages())
                .breakfastIncluded(req.isBreakfastIncluded())
                .freeCancellation(req.isFreeCancellation())
                .active(true)
                .icalExportToken(UUID.randomUUID().toString())
                .build();
        Room saved = roomRepository.save(room);
        hotelService.recalculateLowestPrice(hotelId);
        return saved;
    }

    public Room updateRoom(String roomId, String requesterId, boolean isAdmin, RoomRequest req) {
        Room room = getRoom(roomId);
        Hotel hotel = hotelRepository.findById(room.getHotelId())
                .orElseThrow(() -> new ApiException("Hotel not found", HttpStatus.NOT_FOUND));
        assertOwnership(hotel, requesterId, isAdmin);

        room.setRoomType(req.getRoomType());
        room.setDescription(req.getDescription());
        room.setPricePerNight(req.getPricePerNight());
        room.setMaxOccupancy(req.getMaxOccupancy());
        room.setTotalUnits(req.getTotalUnits());
        room.setFacilities(req.getFacilities());
        room.setImages(req.getImages());
        room.setBreakfastIncluded(req.isBreakfastIncluded());
        room.setFreeCancellation(req.isFreeCancellation());
        Room saved = roomRepository.save(room);
        hotelService.recalculateLowestPrice(room.getHotelId());
        return saved;
    }

    public void deleteRoom(String roomId, String requesterId, boolean isAdmin) {
        Room room = getRoom(roomId);
        Hotel hotel = hotelRepository.findById(room.getHotelId())
                .orElseThrow(() -> new ApiException("Hotel not found", HttpStatus.NOT_FOUND));
        assertOwnership(hotel, requesterId, isAdmin);
        roomRepository.delete(room);
        hotelService.recalculateLowestPrice(hotel.getId());
    }

    /**
     * Returns this room's public iCal export URL, generating and persisting
     * the token first if this room was created before the channel-sync
     * feature existed.
     */
    public String getOrCreateExportUrl(Room room, String baseUrl) {
        if (room.getIcalExportToken() == null || room.getIcalExportToken().isBlank()) {
            room.setIcalExportToken(UUID.randomUUID().toString());
            roomRepository.save(room);
        }
        return baseUrl + "/api/ical/" + room.getId() + "/" + room.getIcalExportToken() + ".ics";
    }
}