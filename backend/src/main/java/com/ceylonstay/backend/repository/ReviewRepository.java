package com.ceylonstay.backend.repository;

import com.ceylonstay.backend.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByHotelId(String hotelId);
}
