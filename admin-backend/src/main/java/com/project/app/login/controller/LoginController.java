package com.project.app.login.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.project.app.config.security.JwtTokenProvider;
import com.project.app.login.dto.LoginRequestDto;
import com.project.app.login.dto.LoginResponseDto;
import com.project.app.login.service.LoginService;
import com.project.app.user.service.UserService;
import com.project.app.userAdmin.entity.UserAdmin;
import com.project.app.userAdmin.service.UserAdminService;

import lombok.extern.slf4j.Slf4j;

/**
 * 로그인 처리 컨트롤러
 * 사용자 로그인 요청을 받아 JWT 토큰을 발급합니다
 */
@Slf4j
@RestController
@RequestMapping(value = {"/api"})
public class LoginController {

	// 사용자 정보를 처리하는 서비스
	private final UserService userService;
	
	private final UserAdminService userAdminService;
	
	// JWT 토큰을 생성하는 클래스
	private final JwtTokenProvider jwtTokenProvider;
	
	// 비밀번호를 암호화/검증하는 도구
	private PasswordEncoder passwordEncoder;

	// 생성자: 필요한 의존성들을 주입받습니다
	public LoginController(LoginService loginService, UserService userService, UserAdminService userAdminService,
			JwtTokenProvider jwtTokenProvider, PasswordEncoder passwordEncoder) {
		this.userService = userService;
		this.userAdminService = userAdminService;
		this.jwtTokenProvider = jwtTokenProvider;
		this.passwordEncoder = passwordEncoder;
	}

	/**
	 * 로그인 API
	 * POST /api/login 또는 /api/login
	 * 
	 * 요청 본문 예시:
	 * {
	 *   "email": "user@user.com",
	 *   "password": "user"
	 * }
	 * 
	 * 응답 예시:
	 * {
	 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	 *   "user": {
	 *     "userId": "eyJhbGciOiJIUzI1NiIsInR5cCI6",
	 *     "email": "user@user.com",
	 *     "userName": "일반",
	 *     "auth": "USER",
	 *     "success": true,
	 *     "message": "로그인 성공"
	 *   }
	 * }
	 */

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequestDto loginRequestDto) {
		// 1. 데이터베이스에서 사용자 조회
//		User user = userService.getUserByEmail(loginRequestDto.getEmail())
//				.orElse(null); // 사용자가 없으면 null 반환
		
		UserAdmin user = userAdminService.getUserByEmail(loginRequestDto.getEmail())
					.orElse(null); // 사용자가 없으면 null 반환
		
        if (user == null) {
            log.warn("Login failed: User not found for email {}", loginRequestDto.getEmail());
            // 401 Unauthorized (인증 실패) 또는 400 Bad Request (잘못된 요청)으로 응답
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                LoginResponseDto.builder()
                    .success(false)
                    .message("권한이 없거나 가입되지 않은 이메일 입니다.")
                    .build()
            );
        }
		
		// 2. 비밀번호 확인 (입력한 평문 비밀번호와 DB의 암호화된 비밀번호 비교)
		if (!passwordEncoder.matches(loginRequestDto.getPassword(), user.getPassword())) {
		    log.warn("Login failed: Incorrect password for user {}", user.getUserId());
			// 401 Unauthorized (인증 실패)으로 응답
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                LoginResponseDto.builder()
                    .success(false)
                    .message("잘못된 비밀번호입니다.")
                    .build()
            );
		}
		
		// 3. 사용자 권한 정보 설정
		List<String> roles = new ArrayList<>();
		roles.add(user.getRole()); // USER, ADMIN 등

		// 4. JWT 토큰 생성 (사용자 아이디와 권한 정보 포함)
		String token = jwtTokenProvider.createToken(user.getUserId(), roles);

		// 5. 응답 데이터 구성
		Map<String, Object> response = new HashMap<>();
		response.put("token", token); // 클라이언트에서 저장하여 사용할 토큰
		response.put("user", LoginResponseDto.builder()
				.userId(user.getUserId())
				.email(user.getEmail())
				.brchId(user.getBrchId())
				.userName(user.getUserName())
				.role(user.getRole())
				.success(true)
				.message("로그인 성공")
				.build());

		// 6. HTTP 200 OK와 함께 응답 반환
		return ResponseEntity.ok(response);
	}
}