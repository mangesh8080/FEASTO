// src/main/java/com/tka/feasto/repository/OrderItemRepository.java
package com.tka.feasto.repository;

import com.tka.feasto.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder_OrderId(Long orderId);
}