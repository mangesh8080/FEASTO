// src/main/java/com/tka/feasto/service/LoyaltyService.java
package com.tka.feasto.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tka.feasto.dto.LoyaltyProgramDTO;
import com.tka.feasto.entity.LoyaltyProgram;
import com.tka.feasto.exception.ResourceNotFoundException;
import com.tka.feasto.mapper.CustomMapper;
import com.tka.feasto.repository.LoyaltyProgramRepository;
import com.tka.feasto.repository.UserRepository;

@Service
public class LoyaltyService {
	@Autowired
	private CustomMapper mapper;

    @Autowired
    private LoyaltyProgramRepository loyaltyProgramRepository;

    @Autowired
    private UserRepository userRepository;

    public LoyaltyProgramDTO subscribe(LoyaltyProgramDTO dto) {
        userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getUserId()));
        LoyaltyProgram program = mapper.toLoyaltyProgram(dto);
        LoyaltyProgram saved = loyaltyProgramRepository.save(program);
        return mapper.toLoyaltyProgramDTO(saved);
    }

    public LoyaltyProgramDTO getLoyaltyByUserId(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        LoyaltyProgram program = loyaltyProgramRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Loyalty program not found for user: " + userId));
        return mapper.toLoyaltyProgramDTO(program);
    }

    public LoyaltyProgramDTO renewLoyalty(Long loyaltyId, LoyaltyProgramDTO dto) {
        LoyaltyProgram program = loyaltyProgramRepository.findById(loyaltyId)
                .orElseThrow(() -> new ResourceNotFoundException("Loyalty program not found with id: " + loyaltyId));
        program.setEndDate(dto.getEndDate());
        LoyaltyProgram updated = loyaltyProgramRepository.save(program);
        return mapper.toLoyaltyProgramDTO(updated);
    }
}