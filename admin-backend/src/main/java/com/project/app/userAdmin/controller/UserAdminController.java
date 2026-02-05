// Fixed @PathVariable name issue
package com.project.app.userAdmin.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.app.branch.domain.Branch;
import com.project.app.branch.service.BranchService;
import com.project.app.config.security.JwtTokenProvider;
import com.project.app.config.util.UserIdGenerator;
import com.project.app.userAdmin.dto.UserAdminRequestDto;
import com.project.app.userAdmin.entity.UserAdmin;
import com.project.app.userAdmin.repository.UserAdminRepository;
import com.project.app.userAdmin.service.UserAdminService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/admin/")
public class UserAdminController {

	private final UserAdminService userAdminService;
	private final BranchService branchService;

	// 생성자 주입
	public UserAdminController(UserAdminService userAdminService,
	                           BranchService branchService) {
		this.userAdminService = userAdminService;
		this.branchService = branchService;
	}

	@GetMapping("/all")
	public ResponseEntity<List<UserAdmin>> getAllUsers(){
		List<UserAdmin> users = userAdminService.getAllUsers();
		return ResponseEntity.ok(users);
	}
	
	@PostMapping("/register")
	public ResponseEntity<?> createUser(@RequestBody UserAdminRequestDto userAdminRequestDto) {
		try {

			if (userAdminRequestDto.getUserId() == null || userAdminRequestDto.getUserId().equalsIgnoreCase("")) {
				UserIdGenerator generator = new UserIdGenerator();
				userAdminRequestDto.setUserId(generator.generateUniqueUserId());

				if (userAdminService.existsByEmail(userAdminRequestDto.getEmail())) {
					return ResponseEntity.badRequest().body("이미 사용중인 이메일 입니다.");
				}
				
				userAdminService.createAdminUser(userAdminRequestDto);
			} else {
				userAdminService.updateAdminUser(userAdminRequestDto);
			}

			return ResponseEntity.status(HttpStatus.CREATED).body(userAdminRequestDto);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("회원가입 처리 중 오류가 발생했습니다. : " + e.getMessage());
		}

	}

	@GetMapping("/userinfo")
	public ResponseEntity<?> userinfo(@RequestParam("userId") String userId) {
		try {
			return ResponseEntity.ok(userAdminService.findByUserId(userId)); // 200 OK와 사용자 정보 반환
		} catch (Exception e) {
			// 로깅 후 클라이언트에 에러 메시지 반환
			// Logger.error("사용자 정보 조회 중 오류 발생: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("사용자 정보 조회 처리 중 오류가 발생했습니다. : " + e.getMessage());
		}

	}
	
	@GetMapping("/branchCode")
	public ResponseEntity<List<Branch>> branchCode(){
		List<Branch> branchCode = branchService.findAll();
		return ResponseEntity.ok(branchCode);
	}
	
	@PostMapping("/updateUserBranch")
	public ResponseEntity<Void> updateUserBranch(@RequestBody UserAdminRequestDto userAdminRequestDto) {
		try {
			userAdminService.updateUserBranch(userAdminRequestDto);
			return ResponseEntity.ok().build(); // 성공 시 200 OK 응답
		} catch (IllegalArgumentException e) {
			log.error("Failed to update user branch for userId {}: {}", userAdminRequestDto.getUserId(), e.getMessage());
			return ResponseEntity.badRequest().build(); // 400 Bad Request
		} catch (Exception e) {
			log.error("Error updating user branch for userId {}: {}", userAdminRequestDto.getUserId(), e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 Internal Server Error
		}
	}
	
	@PostMapping("/updateUserIsActive")
	public ResponseEntity<Void> updateUserIsActive(@RequestBody UserAdminRequestDto userAdminRequestDto) {
		try {
			userAdminService.updateUserIsActive(userAdminRequestDto);
			return ResponseEntity.ok().build(); // 성공 시 200 OK 응답
		} catch (IllegalArgumentException e) {
			log.error("Failed to update user isActive for userId {}: {}", userAdminRequestDto.getUserId(), e.getMessage());
			return ResponseEntity.badRequest().build(); // 400 Bad Request
		} catch (Exception e) {
			log.error("Error updating user isActive for userId {}: {}", userAdminRequestDto.getUserId(), e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 Internal Server Error
		}
	}
	
	@PostMapping("/updateUserRole")
	public ResponseEntity<Void> updateUserRole(@RequestBody UserAdminRequestDto userAdminRequestDto) {
		try {
			userAdminService.updateUserRole(userAdminRequestDto);
			return ResponseEntity.ok().build(); // 성공 시 200 OK 응답
		} catch (IllegalArgumentException e) {
			log.error("Failed to update user isActive for userId {}: {}", userAdminRequestDto.getUserId(), e.getMessage());
			return ResponseEntity.badRequest().build(); // 400 Bad Request
		} catch (Exception e) {
			log.error("Error updating user isActive for userId {}: {}", userAdminRequestDto.getUserId(), e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 Internal Server Error
		}
	}

}
