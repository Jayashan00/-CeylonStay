package com.ceylonstay.backend.service;

import com.ceylonstay.backend.dto.RoomBlockRequest;
import com.ceylonstay.backend.exception.ApiException;
import com.ceylonstay.backend.model.Hotel;
import com.ceylonstay.backend.model.Room;
import com.ceylonstay.backend.model.RoomBlock;
import com.ceylonstay.backend.repository.HotelRepository;
import com.ceylonstay.backend.repository.RoomBlockRepository;
import com.ceylonstay.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Lets a hotel owner take units out of inventory for a date range —
 * maintenance, renovation, an offline booking taken by phone, personal use,
 * etc. These feed directly into AvailabilityService, so the moment a block
 * is saved, guests browsing the site see those dates as unavailable — this
 * is real, not a cosmetic overlay.
 */
@Service
@RequiredArgsConstructor
public class RoomBlockService {

    private final RoomBlockRepository roomBlockRepository;
    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;

    private Room assertOwnsRoom(String roomId, String requesterId, boolean isAdmin) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ApiException("Room not found", HttpStatus.NOT_FOUND));
        if (!isAdmin) {
            Hotel hotel = hotelRepository.findById(room.getHotelId())
                    .orElseThrow(() -> new ApiException("Hotel not found", HttpStatus.NOT_FOUND));
            if (!hotel.getOwnerId().equals(requesterId)) {
                throw new ApiException("You do not own this room", HttpStatus.FORBIDDEN);
            }
        }
        return room;
    }

    public List<RoomBlock> getBlocksForRoom(String roomId, String requesterId, boolean isAdmin) {
        assertOwnsRoom(roomId, requesterId, isAdmin);
        return roomBlockRepository.findByRoomId(roomId);
    }

    public List<RoomBlock> getBlocksForOwnerHotels(List<String> hotelIds) {
        return roomBlockRepository.findByHotelIdIn(hotelIds);
    }

    public RoomBlock createBlock(String roomId, String requesterId, String requesterName, boolean isAdmin, RoomBlockRequest req) {
        Room room = assertOwnsRoom(roomId, requesterId, isAdmin);

        if (!req.getCheckOut().isAfter(req.getCheckIn())) {
            throw new ApiException("End date must be after start date", HttpStatus.BAD_REQUEST);
        }

        RoomBlock block = RoomBlock.builder()
                .roomId(roomId)
                .hotelId(room.getHotelId())
                .checkIn(req.getCheckIn())
                .checkOut(req.getCheckOut())
                .unitsBlocked(Math.max(1, req.getUnitsBlocked()))
                .reason(req.getReason())
                .createdByUserId(requesterId)
                .createdByName(requesterName)
                .build();

        return roomBlockRepository.save(block);
    }

    public void deleteBlock(String blockId, String requesterId, boolean isAdmin) {
        RoomBlock block = roomBlockRepository.findById(blockId)
                .orElseThrow(() -> new ApiException("Block not found", HttpStatus.NOT_FOUND));
        assertOwnsRoom(block.getRoomId(), requesterId, isAdmin);
        roomBlockRepository.delete(block);
    }
}
