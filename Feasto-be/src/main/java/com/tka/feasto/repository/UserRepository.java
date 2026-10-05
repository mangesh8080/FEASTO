// src/main/java/com/tka/feasto/repository/UserRepository.java
package com.tka.feasto.repository;

import com.tka.feasto.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}