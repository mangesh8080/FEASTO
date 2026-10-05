package com.tka.feasto.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import jakarta.persistence.Cacheable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notifications_recipient", columnList = "recipientId"),
        @Index(name = "idx_notifications_is_read", columnList = "is_read")
})

@Cacheable
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String type;
    private String message;
    private Long recipientId;
    private String recipientRole;
    private LocalDateTime timestamp;
    private Boolean isRead;
}
