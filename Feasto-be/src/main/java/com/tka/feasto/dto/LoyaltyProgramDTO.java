package com.tka.feasto.dto;

import com.tka.feasto.enums.MembershipType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyProgramDTO {

    private Long loyaltyId;
    private Long userId;
    private MembershipType membershipType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String benefits;
}