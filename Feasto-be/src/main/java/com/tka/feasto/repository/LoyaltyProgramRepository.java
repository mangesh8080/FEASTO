// src/main/java/com/tka/feasto/repository/LoyaltyProgramRepository.java
package com.tka.feasto.repository;

import com.tka.feasto.entity.LoyaltyProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoyaltyProgramRepository extends JpaRepository<LoyaltyProgram, Long> {
    Optional<LoyaltyProgram> findByUser_UserId(Long userId);
}