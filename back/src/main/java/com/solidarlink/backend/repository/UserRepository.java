package com.solidarlink.backend.repository;

import com.solidarlink.backend.entity.User;
import com.solidarlink.backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByRoleAndIsValidatedFalse(Role role);

    List<User> findByIsValidatedFalse();

    List<User> findByRole(Role role);
}
