package com.ceylonstay.backend.repository;

import com.ceylonstay.backend.model.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RoomRepository extends MongoRepository<Room, String> {
    List<Room> findByHotelId(String hotelId);
    void deleteByHotelId(String hotelId);
}
