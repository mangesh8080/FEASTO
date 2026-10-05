package com.tka.feasto.dto;

import java.time.LocalDateTime;

import com.tka.feasto.entity.Location;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPartnerDTO {

    private Long deliveryPartnerId;
    private String name;
    private String phoneNumber;
    private String email;
    private String password;
    private com.tka.feasto.enums.Role role;
    private String vehicleDetails;
    private Boolean available;
    private Location currentLocation;
    private Double averageRating; // Average rating from customers
    private Integer ordersCompleted; // Total number of completed deliveries
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}