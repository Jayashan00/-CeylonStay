package com.ceylonstay.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reviews")
public class Review {
    @Id
    private String id;

    private String hotelId;
    private String guestId;
    private String guestName;
    private String bookingId;

    private int rating; // 1-10 like booking.com
    private String comment;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
