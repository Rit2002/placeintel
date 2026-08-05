package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.LoginRequest;
import com.rtx.placeintel.dto.RegisterRequest;
import com.rtx.placeintel.entity.Role;
import com.rtx.placeintel.entity.StudentProfile;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.exception.UserAlreadyExistsException;
import com.rtx.placeintel.repository.StudentProfileRepository;
import com.rtx.placeintel.repository.UserRepository;
import com.rtx.placeintel.security.JwtUtil;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public String registerStudent(@Valid  RegisterRequest request) {

        if(userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User already exists.");
        }

        if(studentProfileRepository.existsByEnrollmentNo(request.getEnrollmentNo())) {
            throw new UserAlreadyExistsException("User already exits");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .build();

        userRepository.save(user);

        StudentProfile profile = StudentProfile.builder()
                .user(user)
                .fullName(request.getFullName())
                .enrollmentNo(request.getEnrollmentNo())
                .build();

        studentProfileRepository.save(profile);

        return jwtUtil.generateToken(user.getEmail(), user.getRole());
    }

    public String loginStudent(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return token;
    }
}
