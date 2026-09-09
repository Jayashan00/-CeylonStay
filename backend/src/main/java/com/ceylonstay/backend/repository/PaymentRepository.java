package com.ceylonstay.backend.repository;

import com.ceylonstay.backend.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByBookingId(String bookingId);
    List<Payment> findByHotelId(String hotelId);
    List<Payment> findByHotelIdIn(List<String> hotelIds);
    List<Payment> findByBookingIdIn(List<String> bookingIds);
}
