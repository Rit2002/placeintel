package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.AuthResponse;
import com.rtx.placeintel.dto.AuthResult;
import com.rtx.placeintel.dto.LoginRequest;
import com.rtx.placeintel.dto.RegisterRequest;
import com.rtx.placeintel.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/placeintel/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String COOKIE_NAME = "jwt";

    private final AuthService authService;


    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        AuthResult response =
                authService.registerStudent(request);

        ResponseCookie cookie =
                createAuthCookie(response.token());

        AuthResponse authResponse =
                new AuthResponse(
                        response.role().toString(),
                        response.student_id()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .header(
                        HttpHeaders.SET_COOKIE,
                        cookie.toString()
                )
                .body(
                        new ApiResponse<>(
                                true,
                                "Successfully registered the Student.",
                                authResponse,
                                null
                        )
                );
    }


    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {

        AuthResult response =
                authService.loginStudent(request);

        ResponseCookie cookie =
                createAuthCookie(response.token());

        AuthResponse authResponse =
                new AuthResponse(
                        response.role().toString(),
                        response.student_id()
                );

        return ResponseEntity
                .status(HttpStatus.OK)
                .header(
                        HttpHeaders.SET_COOKIE,
                        cookie.toString()
                )
                .body(
                        new ApiResponse<>(
                                true,
                                "Successfully Logged in.",
                                authResponse,
                                null
                        )
                );
    }


    /**
     * Logs out only the current JWT session.
     *
     * 1. Reads JWT from the HttpOnly cookie.
     * 2. Revokes that JWT server-side.
     * 3. Expires the browser cookie.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(
                    value = COOKIE_NAME,
                    required = false
            )
            String token
    ) {

        /*
         * Revoke the current JWT first.
         */
        authService.logout(token);

        /*
         * Expire the browser cookie.
         */
        ResponseCookie expiredCookie =
                clearAuthCookie();

        return ResponseEntity
                .status(HttpStatus.OK)
                .header(
                        HttpHeaders.SET_COOKIE,
                        expiredCookie.toString()
                )
                .body(
                        new ApiResponse<>(
                                true,
                                "Successfully logged out.",
                                null,
                                null
                        )
                );
    }


    /**
     * Creates the authentication cookie.
     *
     * SameSite=None is required because the frontend
     * and backend are on different origins.
     *
     * Secure=true is required when SameSite=None is used.
     */
    private ResponseCookie createAuthCookie(
            String token
    ) {

        return ResponseCookie
                .from(
                        COOKIE_NAME,
                        token
                )
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(Duration.ofDays(30))
                .build();
    }


    /**
     * Clears the authentication cookie.
     *
     * The attributes match the original authentication
     * cookie so the browser removes the correct cookie.
     */
    private ResponseCookie clearAuthCookie() {

        return ResponseCookie
                .from(
                        COOKIE_NAME,
                        ""
                )
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();
    }
}