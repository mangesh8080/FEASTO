package com.tka.feasto.service;

import java.util.List;
import org.springframework.cache.annotation.Caching;
import com.tka.feasto.entity.Restaurant;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.tka.feasto.dto.ReviewDTO;
import com.tka.feasto.entity.DeliveryPartner;
import com.tka.feasto.entity.Restaurant;
import com.tka.feasto.entity.Review;
import com.tka.feasto.exception.ResourceNotFoundException;
import com.tka.feasto.mapper.CustomMapper;
import com.tka.feasto.repository.OrderRepository;
import com.tka.feasto.repository.RestaurantRepository;
import com.tka.feasto.repository.ReviewRepository;
import com.tka.feasto.repository.UserRepository;

@Service
public class ReviewService {
        @Autowired
        private com.tka.feasto.repository.DeliveryPartnerRepository deliveryPartnerRepository;

        @Autowired
        private CustomMapper mapper;

        @Autowired
        private ReviewRepository reviewRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private RestaurantRepository restaurantRepository;

        @Autowired
        private OrderRepository orderRepository;

        @Caching(evict = {
                @CacheEvict(value = "reviewsByRestaurant", key = "#dto.restaurantId", condition = "#dto.restaurantId != null"),
                @CacheEvict(value = "restaurantById", key = "#dto.restaurantId", condition = "#dto.restaurantId != null"),
                @CacheEvict(value = "restaurantsAll", allEntries = true, condition = "#dto.restaurantId != null"),
                @CacheEvict(value = "deliveryPartnerById", key = "#dto.deliveryPartnerId", condition = "#dto.deliveryPartnerId != null"),
                @CacheEvict(value = "deliveryPartnersAll", allEntries = true, condition = "#dto.deliveryPartnerId != null")
        })
        public ReviewDTO submitReview(ReviewDTO dto) {
                userRepository.findById(dto.getUserId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with id: " + dto.getUserId()));
                if (dto.getRestaurantId() != null) {
                        restaurantRepository.findById(dto.getRestaurantId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Restaurant not found with id: " + dto.getRestaurantId()));
                }
                if (dto.getOrderId() != null) {
                        orderRepository.findById(dto.getOrderId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Order not found with id: " + dto.getOrderId()));
                }
                if (dto.getDeliveryPartnerId() != null) {
                        deliveryPartnerRepository.findById(dto.getDeliveryPartnerId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Delivery Partner not found with id: "
                                                                        + dto.getDeliveryPartnerId()));
                }
                Review review = mapper.toReview(dto);
                // Set delivery partner if present
                if (dto.getDeliveryPartnerId() != null) {
                        review.setDeliveryPartner(deliveryPartnerRepository.findById(dto.getDeliveryPartnerId()).get());
                }
                Review saved = reviewRepository.save(review);

                // Update average rating for delivery partner if applicable
                if (dto.getDeliveryPartnerId() != null) {
                        List<Review> partnerReviews = reviewRepository
                                        .findByDeliveryPartner_DeliveryPartnerId(dto.getDeliveryPartnerId());
                        double avg = partnerReviews.stream().mapToInt(r -> r.getRating() != null ? r.getRating() : 0)
                                        .average().orElse(0.0);
                        DeliveryPartner partner = deliveryPartnerRepository.findById(dto.getDeliveryPartnerId()).get();
                        partner.setAverageRating(avg);
                        deliveryPartnerRepository.save(partner);
                }
             // Update average rating for restaurant if applicable
                if (dto.getRestaurantId() != null) {
                    Object[] agg = reviewRepository.countAndAverageRatingByRestaurant(dto.getRestaurantId());
                    double avg = 0.0;
                    if (agg != null && agg.length >= 2 && agg[1] != null) {
                        avg = ((Number) agg[1]).doubleValue();
                    }
                    Restaurant restaurant = restaurantRepository.findById(dto.getRestaurantId()).get();
                    restaurant.setRating(avg);
                    restaurantRepository.save(restaurant);
                }
                return mapper.toReviewDTO(saved);
        }

        @Cacheable(value = "reviewsByRestaurant", key = "#restaurantId")
        public List<ReviewDTO> getReviewsByRestaurantId(Long restaurantId) {
                restaurantRepository.findById(restaurantId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Restaurant not found with id: " + restaurantId));
                return reviewRepository.findByRestaurant_RestaurantId(restaurantId).stream()
                                .map(mapper::toReviewDTO)
                                .collect(Collectors.toList());
        }
        public List<ReviewDTO> getReviewsByDeliveryPartnerId(Long deliveryPartnerId) {
            deliveryPartnerRepository.findById(deliveryPartnerId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Delivery Partner not found with id: " + deliveryPartnerId));
            return reviewRepository.findByDeliveryPartner_DeliveryPartnerId(deliveryPartnerId).stream()
                    .map(mapper::toReviewDTO)
                    .collect(Collectors.toList());
        }
        

        public ReviewDTO getReviewById(Long id) {
                Review review = reviewRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
                return mapper.toReviewDTO(review);
        }
}