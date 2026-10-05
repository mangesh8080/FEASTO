package com.tka.feasto.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.tka.feasto.entity.Restaurant;

public interface RestaurantRepositoryCustom {
    // Returns a page of Object[] where each element is [Restaurant entity, Double
    // distanceKm]
    Page<Object[]> findNearbyWithDistance(double lat, double lon, Pageable pageable, String sort, double maxDistanceKm);

    // Returns a list of random restaurants (entities). Note: randomness uses DB
    // function; may require DB-specific function name.
    List<Restaurant> findRandomRestaurants(int limit);
}
