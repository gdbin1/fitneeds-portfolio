package com.project.app.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.app.user.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
	boolean existsByUserId(String userId);
	boolean existsByEmail(String email);
    Optional<User> findByUserId(String userId);
    Optional<User> getUserByEmail(String email);
}