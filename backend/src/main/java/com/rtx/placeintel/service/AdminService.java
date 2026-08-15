package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.CreateTpoRequest;
import com.rtx.placeintel.dto.CreateTpoResponse;
import com.rtx.placeintel.entity.enums.Role;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.exception.DuplicateResourceException;
import com.rtx.placeintel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ApiResponse<CreateTpoResponse> createTpo(CreateTpoRequest req) {

        if (userRepository.existsByEmail(req.email())) {

            throw new DuplicateResourceException("Email already registered: " + req.email());
        }

        User tpo = User.builder()
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .role(Role.TPO)
                .enabled(true)
                .build();

        User saved = userRepository.save(tpo);

        CreateTpoResponse response = new CreateTpoResponse(
                saved.getId(),
                saved.getEmail(),
                saved.isEnabled()
        );

        return new ApiResponse<>(
                true,
                "Successfully created the TPO",
                response,
                null
        );
    }
}