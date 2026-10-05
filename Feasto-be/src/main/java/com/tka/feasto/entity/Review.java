package com.tka.feasto.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Cacheable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "reviews", indexes = {
        @Index(name = "idx_reviews_restaurant", columnList = "restaurant_id"),
        @Index(name = "idx_reviews_delivery_partner", columnList = "delivery_partner_id"),
        @Index(name = "idx_reviews_rating", columnList = "rating")
})

@Cacheable
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order; // Optional

    @ManyToOne
    @JoinColumn(name = "delivery_partner_id")
    private DeliveryPartner deliveryPartner; // Nullable, for delivery partner reviews

    private Integer rating; // 1 to 5

    private String comment;

    @CreationTimestamp
    private LocalDateTime reviewTime;
}