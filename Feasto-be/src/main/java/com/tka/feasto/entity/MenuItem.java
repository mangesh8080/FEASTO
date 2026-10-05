package com.tka.feasto.entity;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

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
@Table(name = "menu_items", indexes = {
        @Index(name = "idx_menu_items_restaurant", columnList = "restaurant_id"),
        @Index(name = "idx_menu_items_is_available", columnList = "is_available")
})

@Cacheable
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long menuItemId;

    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    private String name;

    private String description;

    private Double price;

    private String category; // e.g., Appetizer, Main Course, Dessert

    private Boolean isAvailable;
    
    private Double rating;

    private String imageUrl;
    private String cloudinaryPublicId;
}