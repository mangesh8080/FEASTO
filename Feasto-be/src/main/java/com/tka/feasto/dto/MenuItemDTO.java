package com.tka.feasto.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemDTO {

    private Long menuItemId;
    private Long restaurantId;
    private String name;
    private String description;
    private Double price;
    private String category;
    private Boolean isAvailable;
    private Double rating;
    private String imageUrl;
    // Cloudinary public id for deletion
    private String cloudinaryPublicId;
    // When true, indicates the client explicitly wants to remove the stored image
    private Boolean removeImage;
}