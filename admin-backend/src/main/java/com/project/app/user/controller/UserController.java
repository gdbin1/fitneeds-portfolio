// Fixed @PathVariable name issue
package com.project.app.user.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.app.config.security.JwtTokenProvider;
import com.project.app.user.dto.UserRequestDto;
import com.project.app.user.entity.User;
import com.project.app.user.service.UserService;
import com.project.app.userAdmin.entity.UserAdmin;
import com.project.app.userAdmin.service.UserAdminService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/user")
public class UserController {

	private final UserService userService;
	private final UserAdminService userAdminService;

	public UserController(UserService userService, UserAdminService userAdminService, JwtTokenProvider jwtTokenProvider, PasswordEncoder passwordEncoder) {
		this.userService = userService;
		this.userAdminService = userAdminService;
	}

	@GetMapping("/all")
	public ResponseEntity<List<User>> getAllUsers(){
		List<User> users = userService.getAllUsers();
		return ResponseEntity.ok(users);
	}
	
	@GetMapping("/teachers")
	public ResponseEntity<List<UserAdmin>> getAllTeachers(){
		List<UserAdmin> teachers = userAdminService.getTeachers();
		return ResponseEntity.ok(teachers);
	}
	
	@PostMapping("/register")
	public ResponseEntity<?> createUser(@RequestBody UserRequestDto userRequestDto) {
		try {
			if (userRequestDto.getUserId() == null || userRequestDto.getPassword() == null) {
				return ResponseEntity.badRequest().body("아이디와 비밀번호는 필수 항목 입니다.");
			}
			if (userService.existsByUserId(userRequestDto.getUserId())) {
				return ResponseEntity.badRequest().body("이미 사용중인 아이디입니다.");
			}

			userService.createUser(userRequestDto);

			return ResponseEntity.status(HttpStatus.CREATED).body(userRequestDto);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("회원가입 처리 중 오류가 발생했습니다. : " + e.getMessage());
		}
	}

	@GetMapping("/userinfo/{userId}")
	public ResponseEntity<?> userinfo(@PathVariable("userId") String userId) {
		try {
			return ResponseEntity.ok(userService.findByUserId(userId)); // 200 OK와 사용자 정보 반환
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("사용자 정보 조회 처리 중 오류가 발생했습니다. : " + e.getMessage());
		}

	}
	
	@PostMapping("/updateUserIsActive")
	public ResponseEntity<Void> updateUserIsActive(@RequestBody UserRequestDto userRequestDto) {
		try {
			userService.updateUserIsActive(userRequestDto);
			return ResponseEntity.ok().build(); // 성공 시 200 OK 응답
		} catch (IllegalArgumentException e) {
			log.error("Failed to update user isActive for userId {}: {}", userRequestDto.getUserId(), e.getMessage());
			return ResponseEntity.badRequest().build(); // 400 Bad Request
		} catch (Exception e) {
			log.error("Error updating user isActive for userId {}: {}", userRequestDto.getUserId(), e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 Internal Server Error
		}
	}

}
