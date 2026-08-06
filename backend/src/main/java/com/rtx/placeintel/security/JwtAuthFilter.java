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
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
/*
* OncePerRequestFilter — a Spring base class guaranteeing this filter runs exactly once per request (some filter chains can otherwise be invoked multiple times per request internally). This is the standard base class for writing custom auth filters.
* */
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String COOKIE_NAME = "jwt";

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = extractTokenFromCookie(request);


        if(token != null && jwtUtil.isTokenValid(token)) {
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
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            // This attaches extra metadata about the HTTP request itself — things like the caller's remote IP address and session ID — onto the authentication token. Not used for the authentication decision itself, but useful later for logging, auditing, or security monitoring
            authToken.setDetails((new WebAuthenticationDetailsSource().buildDetails(request)));


            //it registers this authentication token into Spring Security's SecurityContext for the current request thread. From this point forward, for the rest of this request's processing.
            SecurityContextHolder.getContext().setAuthentication(authToken);

        }

        filterChain.doFilter(request, response);
    }

    private  String extractTokenFromCookie(HttpServletRequest request) {
        if(request.getCookies() == null) {
            return null;
        }

        /*
        * 1) what request.getCookies() gives you?
        * This returns a plain array of jakarta.servlet.http.Cookie objects — one for every cookie the browser sent with this request.
        * Each Cookie object has a .getName() and .getValue() method — e.g., if the browser sent jwt=eyJhbGciOi...; theme=dark,
        * you'd get an array of two Cookie objects: one named "jwt", one named "theme".
        * We need to find the one specifically named "jwt" and pull out its value. That's the entire goal
        *
        * 2) Arrays.stream(...) :- converts a plain array into a Stream — think of a Stream as a pipeline you can chain operations onto,
        * rather than writing a manual for loop. [.getCookies() return a plain array and you can't apply methods like .filter
        * So we need to convert to stream of array]
        * */

        return Arrays.stream(request.getCookies())
                .filter(cookie -> COOKIE_NAME.equals(cookie.getName()))
                // Cookie::getValue is a method reference — shorthand for the lambda cookie -> cookie.getValue()
                .map(Cookie::getValue)
                // findFirst() here is really just "give me the element if it exists."
                .findFirst()
                .orElse(null);
    }
}
