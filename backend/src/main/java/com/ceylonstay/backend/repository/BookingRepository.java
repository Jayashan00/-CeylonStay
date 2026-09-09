package com.ceylonstay.backend.repository;

import com.ceylonstay.backend.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByGuestId(String guestId);
    List<Booking> findByHotelId(String hotelId);
    List<Booking> findByHotelIdIn(List<String> hotelIds);
    List<Booking> findByRoomId(String roomId);
}
