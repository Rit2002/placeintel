package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.CreateTpoRequest;
import com.rtx.placeintel.dto.CreateTpoResponse;
import com.rtx.placeintel.dto.UpdateTpoRequest;
import com.rtx.placeintel.entity.enums.Role;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.exception.DuplicateResourceException;
import com.rtx.placeintel.exception.ResourceNotFound;
import com.rtx.placeintel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

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
                .fullName(req.fullName())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .role(Role.TPO)
                .enabled(true)
                .build();

        User saved = userRepository.save(tpo);

        CreateTpoResponse response = toResponse(saved);

        return new ApiResponse<>(
                true,
                "Successfully created the TPO",
                response,
                null
        );
    }



    @Transactional(readOnly = true)
    public ApiResponse<List<CreateTpoResponse>> getAllTpos() {

        List<CreateTpoResponse> tpos = userRepository
                .findByRole(Role.TPO)
                .stream()
                .map(this::toResponse)
                .toList();

        return new ApiResponse<>(
                true,
                "Fetched all TPOs",
                tpos,
                null
        );
    }



    @Transactional
    public ApiResponse<CreateTpoResponse> updateTpo(UUID id, UpdateTpoRequest req) {

        User tpo = userRepository
                .findByIdAndRole(id, Role.TPO)
                .orElseThrow(() ->
                        new ResourceNotFound("TPO not found with id: " + id)
                );

        /*
         * Checking for email uniqueness : if admin accidentally
         * sends update of changing email but the email already exists
         * than this block fires
         */
        if (!tpo.getEmail().equalsIgnoreCase(req.email())
                && userRepository.existsByEmail(req.email())) {

            throw new DuplicateResourceException("Email already registered: " + req.email());
        }

        tpo.setFullName(req.fullName());
        tpo.setEmail(req.email());
        tpo.setEnabled(req.enabled());

        User saved = userRepository.save(tpo);

        CreateTpoResponse response = toResponse(saved);

        return new ApiResponse<>(
                true,
                "Successfully updated the TPO",
                response,
                null
        );
    }



    @Transactional
    public ApiResponse<Void> deleteTpo(UUID id) {

        User tpo = userRepository
                .findByIdAndRole(id, Role.TPO)
                .orElseThrow(() ->
                        new ResourceNotFound("TPO not found with id: " + id)
                );

        userRepository.delete(tpo);

        return new ApiResponse<>(
                true,
                "Successfully deleted the TPO",
                null,
                null
        );
    }



    private CreateTpoResponse toResponse(User user) {

        return new CreateTpoResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled()
        );
    }
}