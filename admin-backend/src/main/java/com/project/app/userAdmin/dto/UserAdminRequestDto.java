package com.project.app.userAdmin.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data                   // getter, setter, equals, hashCode, toString 자동 생성
@NoArgsConstructor      // 파라미터 없는 기본 생성자
@AllArgsConstructor     // 모든 필드를 파라미터로 받는 생성자
@Builder                // 빌더 패턴 구현
public class UserAdminRequestDto {
	private String userId;
	private String email;
	private String userName;
	private String password;
	private String role;
	@JsonProperty("isActive")
	private boolean isActive;
//	private LocalDateTime agreeAt;
	private String agreeAt;
	private String phoneNumber;
	private Long brchId;
	private boolean success;
	private String message;
}