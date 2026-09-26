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
    private final UserDetailsServiceImpl userDetailsService;

    /*
     * IMPORTANT FOR SSE
     *
     * SseEmitter uses Servlet asynchronous request processing.
     * Spring can run the security filter chain again during the
     * ASYNC dispatcher phase.
     *
     * OncePerRequestFilter does not have to participate in async
     * dispatches unless we explicitly enable it.
     *
     * Without this override:
     *
     * REQUEST
     *   -> JWT authentication ✅
     *
     * ASYNC
     *   -> JwtAuthFilter skipped
     *   -> SecurityContext empty
     *   -> AnonymousAuthenticationFilter
     *   -> Access Denied ❌
     *
     * With this override, the JWT cookie is read again during the
     * ASYNC dispatch and the SecurityContext is rebuilt.
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

        String token = extractTokenFromCookie(request);

        if (token != null && jwtUtil.isTokenValid(token)) {

            try {

                String email = jwtUtil.extractEmail(token);

                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(email);

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

            } catch (UsernameNotFoundException e) {

                /*
                 * Cookie references a user that no longer exists.
                 * Treat the request as unauthenticated.
                 */
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromCookie(HttpServletRequest request) {

        if (request.getCookies() == null) {
            return null;
        }

        return Arrays.stream(request.getCookies())
                .filter(cookie -> COOKIE_NAME.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}