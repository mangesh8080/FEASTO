package com.tka.feasto.dto;

import com.tka.feasto.entity.Address;
import com.tka.feasto.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long userId;
    private String name;
    private String email;
    private String phoneNumber;
    private String password;
    private Address address;
    private Role role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}