package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.*;
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
     * 1. The JWT is read from the HttpOnly cookie.
     * 2. The exact JWT is revoked in Redis through its JTI.
     * 3. The browser cookie is expired.
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
         * Important:
         *
         * Do this FIRST.
         *
         * If Redis is unavailable and revocation fails,
         * we do not pretend the logout succeeded.
         *
         * Therefore the browser cookie is not cleared until
         * the server has successfully processed the revocation.
         */
        authService.logout(token);

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

    private ResponseCookie createAuthCookie(
            String token
    ) {

        return ResponseCookie
                .from(
                        COOKIE_NAME,
                        token
                )
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(30))
                .build();
    }

    private ResponseCookie clearAuthCookie() {

        return ResponseCookie
                .from(
                        COOKIE_NAME,
                        ""
                )
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();
    }
}