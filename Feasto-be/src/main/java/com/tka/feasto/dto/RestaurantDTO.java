package com.tka.feasto.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.tka.feasto.entity.Address;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantDTO {

    private Long restaurantId;
    private String name;
    private String description;
    private Address address;
    private String phoneNumber;
    private String cuisineType;
    // Credentials (used for registration/login flows)
    private String email;
    private String password;
    private Double rating;
    private Boolean isActive;
    private com.tka.feasto.enums.Role role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Distance from user in kilometers (optional, populated by location queries)
    private Double distanceKm;

    // A small list of special/top menu items to show in listings
    private List<MenuItemDTO> specialMenuItems;

    private String imageUrl;
    private String cloudinaryPublicId;
}