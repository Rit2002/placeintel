package com.rtx.placeintel.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String COOKIE_NAME = "jwt";

    private final JwtUtil jwtUtil;
    private final JwtRevocationService jwtRevocationService;
    private final UserDetailsServiceImpl userDetailsService;

    /*
     * IMPORTANT FOR SSE
     *
     * SseEmitter uses Servlet asynchronous request processing.
     *
     * The JWT authentication must therefore be reconstructed
     * during ASYNC dispatches as well.
     */
    @Override
    protected boolean shouldNotFilterAsyncDispatch() {
        return false;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String token =
                extractTokenFromCookie(request);

        if (token != null && jwtUtil.isTokenValid(token)) {

            try {

                /*
                 * -------------------------------------------------
                 * STEP 1
                 * Get the unique JWT session identifier.
                 * -------------------------------------------------
                 */
                String jti =
                        jwtUtil.extractJti(token);

                /*
                 * -------------------------------------------------
                 * STEP 2
                 * Check server-side revocation.
                 *
                 * If this JWT was logged out, do NOT authenticate
                 * the request even though the JWT signature itself
                 * is still valid.
                 * -------------------------------------------------
                 */
                if (jwtRevocationService.isRevoked(jti)) {

                    SecurityContextHolder
                            .clearContext();

                    /*
                     * We do not stop the filter chain here.
                     *
                     * Spring Security will see that there is no
                     * authenticated user and will reject protected
                     * endpoints normally.
                     */
                    filterChain.doFilter(
                            request,
                            response
                    );

                    return;
                }

                /*
                 * -------------------------------------------------
                 * STEP 3
                 * Extract user identity from JWT.
                 * -------------------------------------------------
                 */
                String email =
                        jwtUtil.extractEmail(token);

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(email);

                /*
                 * -------------------------------------------------
                 * STEP 4
                 * Build Spring Security authentication.
                 * -------------------------------------------------
                 */
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authToken);

                System.out.println(
                        "JWT authentication set. DispatcherType="
                                + request.getDispatcherType()
                                + ", Authorities="
                                + authToken.getAuthorities()
                );

            } catch (
                    UsernameNotFoundException e
            ) {

                /*
                 * Cookie references a user that no longer exists.
                 */
                SecurityContextHolder
                        .clearContext();

            }
        }

        filterChain.doFilter(
                request,
                response
        );
    }

    private String extractTokenFromCookie(
            HttpServletRequest request
    ) {

        if (request.getCookies() == null) {
            return null;
        }

        return Arrays
                .stream(request.getCookies())
                .filter(
                        cookie ->
                                COOKIE_NAME.equals(
                                        cookie.getName()
                                )
                )
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}