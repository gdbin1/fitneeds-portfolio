package com.project.app.userAdmin.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.project.app.userAdmin.dto.UserAdminRequestDto;
import com.project.app.userAdmin.entity.UserAdmin;
import com.project.app.userAdmin.repository.UserAdminRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class UserAdminServiceImpl implements UserAdminService {
	private final UserAdminRepository userAdminRepository;
	private final PasswordEncoder passwordEncoder;

	public UserAdminServiceImpl(UserAdminRepository userAdminRepository, PasswordEncoder passwordEncoder) {
		this.userAdminRepository = userAdminRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional
	public UserAdmin createAdminUser(UserAdminRequestDto userAdminRequestDto) {
		UserAdmin user = UserAdmin.builder().userId(userAdminRequestDto.getUserId()).userName(userAdminRequestDto.getUserName())
				.password(passwordEncoder.encode(userAdminRequestDto.getPassword())) // 비밀번호 암호화
				.role("USER") // 기본 권한 설정 admin 사용자 관리 에서 수정.
				.email(userAdminRequestDto.getEmail()).phoneNumber(userAdminRequestDto.getPhoneNumber())
				.agreeAt(LocalDateTime.now())
				.isActive(true).build();
		
		return userAdminRepository.save(user);
	}
	
	@Transactional
	public UserAdmin updateAdminUser(UserAdminRequestDto userAdminRequestDto) {
		UserAdmin existingUser = userAdminRepository.findByUserId(userAdminRequestDto.getUserId())
				.orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
		existingUser.setUserName(userAdminRequestDto.getUserName());
		existingUser.setEmail(userAdminRequestDto.getEmail());
		existingUser.setPhoneNumber(userAdminRequestDto.getPhoneNumber());
		
		if (!passwordEncoder.matches(userAdminRequestDto.getPassword(), existingUser.getPassword())) {
			existingUser.setPassword(passwordEncoder.encode(userAdminRequestDto.getPassword()));	
		}

		return userAdminRepository.save(existingUser);
	}
	
	// 아이디 존재 유무조회
	public boolean existsByUserId(String userId) {
		return userAdminRepository.existsByUserId(userId);
	}

	// email 존재 유무조회
	public boolean existsByEmail(String email) {
		return userAdminRepository.existsByEmail(email);
	}

	// 아이디로 사용자 조회
	public Optional<UserAdmin> findByUserId(String userId) {
		return userAdminRepository.findByUserId(userId);
	}

	public List<UserAdmin> getAllUsers() {
		return userAdminRepository.findAll();
	}

	public List<UserAdmin> getTeachers() {
		return userAdminRepository.findByUserIdContaining("teacher");
	}

	public Optional<UserAdmin> getUserByEmailAdmin(String email) {
		return userAdminRepository.getUserByEmailAndRole(email, "ADMIN");
	}
	
	public Optional<UserAdmin> getUserByEmail(String email) {
        return userAdminRepository.getUserByEmail(email);
    }

	@Override
	public void updateUserBranch(UserAdminRequestDto userAdminRequestDto) {
		UserAdmin user = findByUserId(userAdminRequestDto.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));
		user.setBrchId(userAdminRequestDto.getBrchId());
		userAdminRepository.save(user);
	}
	
	@Override
	public void updateUserIsActive(UserAdminRequestDto userAdminRequestDto) {
		UserAdmin user = findByUserId(userAdminRequestDto.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));
		user.setIsActive(userAdminRequestDto.isActive());
		userAdminRepository.save(user);
	}
	
	@Override
	public void updateUserRole(UserAdminRequestDto userAdminRequestDto) {
		UserAdmin user = findByUserId(userAdminRequestDto.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));
		user.setRole(userAdminRequestDto.getRole());
		userAdminRepository.save(user);
	}


}
