package com.project.app.user.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.project.app.user.dto.UserRequestDto;
import com.project.app.user.entity.User;
import com.project.app.user.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class UserServiceImpl implements UserService{
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	
	public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional
	public User createUser(UserRequestDto userRequestDto) {
		User user = User.builder().userId(userRequestDto.getUserId()).userName(userRequestDto.getUserName())
				.password(passwordEncoder.encode(userRequestDto.getPassword())) // 비밀번호 암호화
				.role("USER") // 기본 권한 설정 admin 사용자 관리 에서 수정.
				.email(userRequestDto.getEmail()).phoneNumber(userRequestDto.getPhoneNumber())
				.agreeAt(LocalDateTime.now())
				.isActive(true)
				.build();

		return userRepository.save(user);
	}

	// 아이디 존재 유무조회
	public boolean existsByUserId(String userId) {
		return userRepository.existsByUserId(userId);
	}
	
	// email 존재 유무조회
	public boolean existsByEmail(String email) {
		return userRepository.existsByEmail(email);
	}

    // 아이디로 사용자 조회
    public Optional<User> findByUserId(String userId) {
        return userRepository.findByUserId(userId);
    }

	public Optional<User> getUserByEmail(String email) {
        return userRepository.getUserByEmail(email);
    }

	@Override
	public User updateUser(UserRequestDto userRequestDto) {
		User user = findByUserId(userRequestDto.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));
		user.setUserName(userRequestDto.getUserName());
		user.setPassword(passwordEncoder.encode(userRequestDto.getPassword()));
		user.setEmail(userRequestDto.getEmail());
		user.setPhoneNumber(userRequestDto.getPhoneNumber());

		return userRepository.save(user);
	}
}