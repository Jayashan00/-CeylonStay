package com.ceylonstay.backend.repository;

import com.ceylonstay.backend.model.Hotel;
import com.ceylonstay.backend.model.HotelStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface HotelRepository extends MongoRepository<Hotel, String> {
    List<Hotel> findByOwnerId(String ownerId);
    List<Hotel> findByStatus(HotelStatus status);
    List<Hotel> findByDistrictIgnoreCaseAndStatus(String district, HotelStatus status);
    List<Hotel> findByNameContainingIgnoreCaseAndStatus(String name, HotelStatus status);
}
