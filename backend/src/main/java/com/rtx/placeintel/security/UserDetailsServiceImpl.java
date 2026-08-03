package com.rtx.placeintel.security;

import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/*
Spring Security doesn't know anything about your User entity, your UserRepository, or your database schema.
Spring Security asks UserDetailsService for our custom data,
and Spring provides a default implementation of UserDetails (called org.springframework.security.core.userdetails.User)
that we populate with our data.
*/
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(@NonNull String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        /*
        This fully-qualified name isn't decoration — it's necessary.
        You have two classes named User in this file's scope:

            com.rtx.placeintel.entity.User — your JPA entity
            org.springframework.security.core.userdetails.User — Spring Security's built-in UserDetails implementation
            Since your class is called User too, Java can't resolve a bare User.builder() unambiguously — you must fully qualify Spring's version so the compiler knows which one you mean.
            This is a classic naming collision Spring Security itself set you up for.
            Spring's User class is a ready-made, generic implementation of UserDetails — you don't have to write your own UserDetails implementation from scratch; you just populate Spring's version using data pulled from your entity.

            .username(user.getEmail())
            Spring Security's internal concept of "username" — in your case, mapped to email since that's how users log in.

            .password(user.getPassword())
            The already-hashed password from your DB (BCrypt). Spring Security compares this against the incoming login attempt's password (also hashed at compare-time) — it never sees plaintext.

            .disabled(!user.isEnabled())
            This is exactly the enabled vs. verificationStatus separation you designed earlier. UserDetails has a built-in isEnabled() check — if disabled is true, Spring Security rejects login entirely, before even checking the password. This is your enforcement point for account status.

            .authorities(...)
            This tells Spring Security what this user is allowed to do. GrantedAuthority is Spring's permission/role abstraction. The "ROLE_" prefix is a Spring Security convention


         */
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .disabled(!user.isEnabled())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();
    }
}
