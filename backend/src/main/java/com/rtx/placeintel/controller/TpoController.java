package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.UserProfileResponse;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.entity.enums.Role;
import com.rtx.placeintel.util.CurrentUserResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/placeintel/api/v1")
@RequiredArgsConstructor
public class TpoController {


    private final CurrentUserResolver currentUserResolver;



    @GetMapping("/tpo/me")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyUserInfo(Authentication authentication) {

        User user = currentUserResolver.resolve(authentication);

        UserProfileResponse userProfileResponse = new UserProfileResponse(
                user.getFullName(),
                user.getEmail(),
                Role.TPO.toString()
        );

        ApiResponse<UserProfileResponse> response = new ApiResponse<>(
                true,
                "Successfully fetched the tpo info",
                userProfileResponse,
                null
        );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }
}
