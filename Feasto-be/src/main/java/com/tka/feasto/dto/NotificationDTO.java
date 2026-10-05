package com.tka.feasto.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private String type; // e.g. ORDER_PLACED, ORDER_ACCEPTED, etc.
    private String message;
    private Long recipientId; // userId, restaurantId, or deliveryPartnerId
    private String recipientRole; // CUSTOMER, RESTAURANT, DELIVERY_PARTNER
    private LocalDateTime timestamp;
    private Boolean isRead = false;
}
