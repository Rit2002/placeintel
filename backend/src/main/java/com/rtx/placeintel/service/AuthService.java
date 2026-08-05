package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.AuthResponse;
import com.rtx.placeintel.dto.RegisterRequest;
import com.rtx.placeintel.entity.Role;
import com.rtx.placeintel.entity.StudentProfile;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.exception.UserAlreadyExistsException;
import com.rtx.placeintel.repository.StudentProfileRepository;
import com.rtx.placeintel.repository.UserRepository;
import com.rtx.placeintel.security.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
//import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
//    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse registerStudent(RegisterRequest request) {

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

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return new AuthResponse(
                token,
                "Successfully registered the student.",
                "Student"
                );
    }

}
