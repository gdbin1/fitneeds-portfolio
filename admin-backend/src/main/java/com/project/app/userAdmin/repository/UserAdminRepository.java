package com.project.app.userAdmin.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.app.userAdmin.entity.UserAdmin;

@Repository
public interface UserAdminRepository extends JpaRepository<UserAdmin, String> {
	boolean existsByUserId(String userId);
	boolean existsByEmail(String email);
    Optional<UserAdmin> findByUserId(String userId);
    List<UserAdmin> findByUserIdContaining(String keyword);
    Optional<UserAdmin> getUserByEmailAndRole(String email, String role);
    Optional<UserAdmin> getUserByEmail(String email);
}