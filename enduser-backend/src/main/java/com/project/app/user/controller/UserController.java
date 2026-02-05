package com.project.app.user.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.app.config.security.JwtTokenProvider;
import com.project.app.config.util.UserIdGenerator;
import com.project.app.user.dto.UserRequestDto;
import com.project.app.user.service.UserService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/user")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService, JwtTokenProvider jwtTokenProvider, PasswordEncoder passwordEncoder) {
		this.userService = userService;
	}

	@PostMapping("/register")
	public ResponseEntity<?> createUser(@RequestBody UserRequestDto userRequestDto) {
		try {

			if (userRequestDto.getUserId().equalsIgnoreCase(null)||userRequestDto.getUserId().equalsIgnoreCase("")) {
				UserIdGenerator generator = new UserIdGenerator();
				userRequestDto.setUserId(generator.generateUniqueUserId());
				
				if (userService.existsByEmail(userRequestDto.getEmail())) {
					return ResponseEntity.badRequest().body("이미 사용중인 이메일 입니다.");
				}
				
				userService.createUser(userRequestDto);
			} else {
				userService.updateUser(userRequestDto);
			}
			
			return ResponseEntity.status(HttpStatus.CREATED).body(userRequestDto);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("회원가입 처리 중 오류가 발생했습니다. : " + e.getMessage());
		}
	}

	@GetMapping("/userinfo")
	public ResponseEntity<?> userinfo(@RequestParam("userId") String userId) {
		try {
			return ResponseEntity.ok(userService.findByUserId(userId)); // 200 OK와 사용자 정보 반환
		} catch (Exception e) {
			// 로깅 후 클라이언트에 에러 메시지 반환
			// Logger.error("사용자 정보 조회 중 오류 발생: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("사용자 정보 조회 처리 중 오류가 발생했습니다. : " + e.getMessage());
		}

	}

}