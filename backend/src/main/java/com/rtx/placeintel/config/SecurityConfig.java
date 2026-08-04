package com.rtx.placeintel.config;

import com.rtx.placeintel.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/*
* Tells Spring: "this class defines beans — don't just treat it as a regular class, scan it for @Bean methods and register their return values in the application context
* */
@Configuration
/*
* Spring starts wrapping every HTTP request through a chain of security filters before it reaches your controller.
* It tells Spring:"Use my SecurityConfig class as the application's security configuration."
 */
@EnableWebSecurity
/*
* This lets you put security rules directly on methods elsewhere in your code — things like @PreAuthorize("hasRole('ADMIN')") on a service or controller method
* */
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        /*
        * 1) DaoAuthenticationProvider : It is a class provided by Spring Security.It implements the AuthenticationProvider interface.
        * Its job is: Authenticate a user using data stored in a database.
        * 2) "DAO" stands for Data Access Object.
        * 3) userDetailsService : Internally Dao call the userDetailsService.loadUserByUsername("riteshchavan@gmail.com")
        * to fetch the data from DB to authenticate so userDetailsService is passed to Dao
        * */
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);

        /*
        * This line is configuring the DaoAuthenticationProvider by telling it which algorithm to use when verifying passwords.
        * After setting "setPasswordEncoder" method "Dao" know how to compare passwords.
        * */
        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                /* UsernamePasswordAuthenticationFilter is Spring's default filter for form-login-style authentication
                * addFilterBefore inserts your jwtAuthFilter to run before it
                * */
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
