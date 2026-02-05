package com.project.app.user.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.app.user.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
	boolean existsByUserId(String userId);
	boolean existsByEmail(String email);
    Optional<User> findByUserId(String userId);
    List<User> findByRole(String role);
    Optional<User> getUserByEmailAndRole(String email, String role);
    Optional<User> getUserByEmail(String email);
    // 사용자 검색용 (이름 또는 ID로 검색)
    List<User> findByUserNameContainingOrUserIdContaining(String userName, String userId);
}