package com.ceylonstay.backend.service;

import com.ceylonstay.backend.dto.ReviewRequest;
import com.ceylonstay.backend.model.Hotel;
import com.ceylonstay.backend.model.Review;
import com.ceylonstay.backend.repository.HotelRepository;
import com.ceylonstay.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final HotelRepository hotelRepository;

    public List<Review> getReviewsForHotel(String hotelId) {
        return reviewRepository.findByHotelId(hotelId);
    }

    public Review addReview(String guestId, String guestName, ReviewRequest req) {
        Review review = Review.builder()
                .hotelId(req.getHotelId())
                .guestId(guestId)
                .guestName(guestName)
                .bookingId(req.getBookingId())
                .rating(req.getRating())
                .comment(req.getComment())
                .build();
        Review saved = reviewRepository.save(review);
        recalcHotelRating(req.getHotelId());
        return saved;
    }

    private void recalcHotelRating(String hotelId) {
        List<Review> reviews = reviewRepository.findByHotelId(hotelId);
        Hotel hotel = hotelRepository.findById(hotelId).orElse(null);
        if (hotel == null) return;
        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        hotel.setAverageRating(Math.round(avg * 10.0) / 10.0);
        hotel.setReviewCount(reviews.size());
        hotelRepository.save(hotel);
    }
}
