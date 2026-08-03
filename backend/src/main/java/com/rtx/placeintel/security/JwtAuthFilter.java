package com.rtx.placeintel.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
/*
* OncePerRequestFilter — a Spring base class guaranteeing this filter runs exactly once per request (some filter chains can otherwise be invoked multiple times per request internally). This is the standard base class for writing custom auth filters.
* */
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse reponse,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if(authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, reponse);
            return;
        }

        String token = authHeader.substring(7);

        if(jwtUtil.isTokenValid(token)) {
            String email = jwtUtil.extractEmail(token);
            // It goes back to the database, fetches the current User row for that email, and rebuilds a fresh UserDetails object (username, password, authorities, enabled status).
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            /*
            * 1) UsernamePasswordAuthenticationToken is a class — a concrete implementation of Spring Security's Authentication interface
            * 2) Spring ships it as a ready-made class so you don't have to write your own Authentication implementation from scratch.
            * 3) new UsernamePasswordAuthenticationToken(username, password) : new UsernamePasswordAuthenticationToken(username, password)
            * 4) new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()) : This is the 3-arg constructor — used to represent an already-confirmed identity.
            * isAuthenticated() [when you use any where in the code] returns true automatically because you supplied authorities (Spring treats "has authorities" as a signal that verification already happened).
            * 5) isAuthenticated() :- It's a method. It belongs to the Authentication interface itself
            * */
            UsernamePasswordAuthenticationToken authtoken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            // This attaches extra metadata about the HTTP request itself — things like the caller's remote IP address and session ID — onto the authentication token. Not used for the authentication decision itself, but useful later for logging, auditing, or security monitoring
            authtoken.setDetails((new WebAuthenticationDetailsSource().buildDetails(request)));


            //it registers this authentication token into Spring Security's SecurityContext for the current request thread. From this point forward, for the rest of this request's processing.
            SecurityContextHolder.getContext().setAuthentication(authtoken);

        }

        filterChain.doFilter(request, reponse);
    }
}
