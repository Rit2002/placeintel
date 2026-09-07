package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.*;
import com.rtx.placeintel.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/placeintel/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;




    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid  @RequestBody RegisterRequest request) {

        AuthResult response = authService.registerStudent(request);

        ResponseCookie cookie = ResponseCookie.from("jwt", response.token())
                .httpOnly(true) // prevents client side js to access the cookie, mitigates XSS attack
                .secure(false) // true : sends the cookie over https
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(30))
                .build();

        AuthResponse authResponse = new AuthResponse(response.role().toString());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new ApiResponse<>(
                        true,
                        "Successfully registered the Student.",
                        authResponse,
                        null
                ));
    }




    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {

        AuthResult response = authService.loginStudent(request);

        ResponseCookie cookie = ResponseCookie.from("jwt", response.token())
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(30))
                .build();

        AuthResponse authResponse = new AuthResponse(response.role().toString());

        return ResponseEntity
                .status(HttpStatus.OK)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new ApiResponse<>(
                        true,
                        "Successfully Logged in.",
                        authResponse,
                        null
                ));

    }
}
