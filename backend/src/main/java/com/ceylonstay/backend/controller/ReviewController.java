package com.ceylonstay.backend.controller;

import com.ceylonstay.backend.dto.ReviewRequest;
import com.ceylonstay.backend.model.Review;
import com.ceylonstay.backend.security.UserPrincipal;
import com.ceylonstay.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/hotel/{hotelId}")
    public List<Review> forHotel(@PathVariable String hotelId) {
        return reviewService.getReviewsForHotel(hotelId);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Review add(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody ReviewRequest request) {
        return reviewService.addReview(principal.getId(), principal.getUser().getFullName(), request);
    }
}
