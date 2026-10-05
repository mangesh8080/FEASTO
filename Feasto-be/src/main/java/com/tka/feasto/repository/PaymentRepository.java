// src/main/java/com/tka/feasto/repository/PaymentRepository.java
package com.tka.feasto.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tka.feasto.entity.Order;
import com.tka.feasto.entity.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrder(Order order);
}