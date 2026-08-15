package com.rtx.placeintel.config;

import com.rtx.placeintel.entity.enums.Role;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail("admin@placeintel.com")) {
            return;
        }

        User admin = User.builder()
                .email("admin@placeintel.com")
                .password(passwordEncoder.encode("admin@2002"))
                .role(Role.ADMIN)
                .enabled(true)
                .build();

        userRepository.save(admin);
        System.out.println(">>> Seeded default Admin account: admin@placeintel.com");
    }
}