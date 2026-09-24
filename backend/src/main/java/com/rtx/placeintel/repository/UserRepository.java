package com.rtx.placeintel.repository;

import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

//                                                  <Type, primary_key type>
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByIdAndRole(UUID id, Role role);

    List<User> findByRole(Role role);
}