package com.tka.feasto.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {

    private Long reviewId;
    private Long userId;
    private Long restaurantId;
    private Long orderId;
    private Long deliveryPartnerId;
    private Integer rating;
    private String comment;
    private LocalDateTime reviewTime;
}