package com.tka.feasto.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tka.feasto.dto.ReviewDTO;
import com.tka.feasto.service.ReviewService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewDTO> submitReview(@Valid @RequestBody ReviewDTO dto) {
        return ResponseEntity.ok(reviewService.submitReview(dto));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByRestaurantId(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(reviewService.getReviewsByRestaurantId(restaurantId));
    }
    
    @GetMapping("/delivery-partner/{deliveryPartnerId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByDeliveryPartnerId(@PathVariable Long deliveryPartnerId) {
        return ResponseEntity.ok(reviewService.getReviewsByDeliveryPartnerId(deliveryPartnerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewDTO> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    @PostMapping("/quick-commerce")
    public ResponseEntity<ReviewDTO> submitQuickCommerceReview(@Valid @RequestBody ReviewDTO dto) {
        // Same as regular review, assuming orderId links to quick commerce order
        return ResponseEntity.ok(reviewService.submitReview(dto));
    }
}