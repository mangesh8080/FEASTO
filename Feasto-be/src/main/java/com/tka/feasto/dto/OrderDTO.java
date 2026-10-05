package com.tka.feasto.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.tka.feasto.entity.Address;
import com.tka.feasto.enums.OrderStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {

    private Long orderId;
    private Long userId;
    private Long restaurantId;
    private Long deliveryPartnerId;
    private OrderStatus orderStatus;
    private Double totalAmount;
    private Address deliveryAddress;
    private LocalDateTime orderTime;
    private LocalDateTime deliveryTime;
    private List<OrderItemDTO> orderItems;
}