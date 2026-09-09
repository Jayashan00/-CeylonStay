package com.ceylonstay.backend.repository;

import com.ceylonstay.backend.model.RoomBlock;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RoomBlockRepository extends MongoRepository<RoomBlock, String> {
    List<RoomBlock> findByRoomId(String roomId);
    List<RoomBlock> findByHotelId(String hotelId);
    List<RoomBlock> findByHotelIdIn(List<String> hotelIds);
}
