package com.tka.feasto.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.CreationTimestamp;

import com.tka.feasto.enums.OrderStatus;

import jakarta.persistence.Cacheable;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders", indexes = {
        @Index(name = "idx_orders_restaurant", columnList = "restaurant_id"),
        @Index(name = "idx_orders_user", columnList = "user_id"),
        @Index(name = "idx_orders_delivery_partner", columnList = "delivery_partner_id"),
        @Index(name = "idx_orders_status", columnList = "order_status"),
        @Index(name = "idx_orders_order_time", columnList = "order_time")
})

@Cacheable
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @ManyToOne
    @JoinColumn(name = "delivery_partner_id")
    private DeliveryPartner deliveryPartner; // Nullable

    @Enumerated(EnumType.STRING)
    private OrderStatus orderStatus; // Enum: PLACED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED

    private Double totalAmount;

    @Embedded
    private Address deliveryAddress;

    @CreationTimestamp
    private LocalDateTime orderTime;

    private LocalDateTime deliveryTime; // Nullable

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems = new ArrayList<>();
}