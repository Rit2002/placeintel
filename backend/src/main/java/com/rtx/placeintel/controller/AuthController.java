package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.LoginRequest;
import com.rtx.placeintel.dto.RegisterRequest;
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
    public ResponseEntity<String> register(@Valid  @RequestBody RegisterRequest request) {

        String response = authService.registerStudent(request);

        ResponseCookie cookie = ResponseCookie.from("jwt", response)
                .httpOnly(true) // prevents client side js to access the cookie, mitigates XSS attack
                .secure(false) // true : sends the cookie over https
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(30))
                .build();

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Successfully registered the Student.");
    }




    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody LoginRequest request) {

        String response = authService.loginStudent(request);

        ResponseCookie cookie = ResponseCookie.from("jwt", response)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(30))
                .build();

        return ResponseEntity
                .status(HttpStatus.OK)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Successfully logged in.");

    }
}
