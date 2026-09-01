package com.rtx.placeintel.security;


import com.rtx.placeintel.entity.StudentProfile;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.entity.enums.Role;
import com.rtx.placeintel.entity.enums.VerificationStatus;
import com.rtx.placeintel.repository.StudentProfileRepository;
import com.rtx.placeintel.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Order(2) // is used to control the execution/order of multiple Spring components when Spring has to choose between them.
public class VerificationGateFilter extends OncePerRequestFilter {





    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    // AntPathMatcher is basically the URL pattern matching engine.
    private final AntPathMatcher pathMatcher = new AntPathMatcher();






    private static final List<String> PROTECTED_PATTERNS = List.of(
            "/placeintel/api/v1/company/*",
            "/placeintel/api/v1/companies/*/resources",
            "/placeintel/api/v1/company/drive/**",
            "/placeintel/api/v1/students/me/mock-interview/**",
            "/placeintel/api/v1/companies/*/prep-chat"
    );





    // This method is a custom Spring Security filter.
    // It intercepts an HTTP request & decides whether the request is allowed or NOT.


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        if(!isProtectedPath(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if(auth == null || !auth.isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }

        Optional<User> userOpt = userRepository.findByEmail(auth.getName());

        if(userOpt.isEmpty() || userOpt.get().getRole() != Role.STUDENT) {

            filterChain.doFilter(request, response);
            return;
        }

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userOpt.get().getId());

        boolean verified = profileOpt.isPresent()
                && profileOpt.get().getVerificationStatus() == VerificationStatus.VERIFIED;
        /*
        * Checks if the student is present and is verified and if not send 403 forbidden response
        * */
        if (!verified) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            /*
              {
                  "success": false,
                  "message": "Your profile must be verified by TPO before accessing this content",
                  "data": null,
                  "error": "UNVERIFIED_STUDENT"
                }
               */
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Your profile must be verified by TPO before accessing this content\",\"data\":null,\"error\":\"UNVERIFIED_STUDENT\"}"
            );
            return;
        }

        filterChain.doFilter(request, response);

    }




    // Helper Methods
    // Since isProtectedPath uses pathMatcher (an instance field), it needs an instance of VerificationGateFilter to run
    private boolean isProtectedPath(String uri) {
        // Checks whether the given uri matches at least one pattern in PROTECTED_PATTERNS.
        // EX: pathMatcher.match("/api/users/**", "/api/users/123")
        return PROTECTED_PATTERNS.stream().anyMatch(
                pattern -> pathMatcher.match(pattern, uri)
        );
    }
}