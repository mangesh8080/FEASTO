package com.tka.feasto.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tka.feasto.dto.UserDTO;
import com.tka.feasto.entity.User;
import com.tka.feasto.exception.ResourceNotFoundException;
import com.tka.feasto.exception.UnauthorizedException;
import com.tka.feasto.exception.ValidationException;
import com.tka.feasto.mapper.CustomMapper;
import com.tka.feasto.repository.UserRepository;
import com.tka.feasto.util.ValidationUtil;

@Service
public class UserService {
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomMapper mapper;

    public UserDTO registerUser(UserDTO userDTO) {
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new ValidationException("Email already exists");
        }
        if (!ValidationUtil.isValidPhone(userDTO.getPhoneNumber())) {
            throw new ValidationException("Phone number must be 10 digits, with an optional country code (e.g. +91)");
        }
        User user = mapper.toUser(userDTO);
        // ensure default role
        if (user.getRole() == null) {
            user.setRole(com.tka.feasto.enums.Role.CUSTOMER);
        }
        user.setPassword(user.getPassword());
        User savedUser = userRepository.save(user);

        // Notify user on registration
        com.tka.feasto.dto.NotificationDTO notification = new com.tka.feasto.dto.NotificationDTO();
        notification.setType("USER_REGISTERED");
        notification.setMessage("Welcome, " + savedUser.getName() + "! Your account has been created.");
        notification.setRecipientId(savedUser.getUserId());
        notificationService.notifyUser(savedUser.getUserId(), notification);

        return mapper.toUserDTO(savedUser);
    }

    public UserDTO loginUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        System.out.println(user.getPassword());
        System.out.println(password);
        if (!user.getPassword().equals(password)) {
            throw new UnauthorizedException("Invalid credentials");
        }
        return mapper.toUserDTO(user);
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapper.toUserDTO(user);
    }

    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (userDTO.getName() != null) {
            user.setName(userDTO.getName());
        }
        if (userDTO.getPhoneNumber() != null) {
            user.setPhoneNumber(userDTO.getPhoneNumber());
        }
        if (userDTO.getAddress() != null) {
            user.setAddress(userDTO.getAddress());
        }
        // Email and password are intentionally not changed here since they are
        // used for login; changing them would need a separate, verified flow.

        User updatedUser = userRepository.save(user);
        return mapper.toUserDTO(updatedUser);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(mapper::toUserDTO)
                .collect(Collectors.toList());
    }
}