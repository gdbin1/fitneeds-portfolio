package com.project.app.login.dto; // 패키지 변경

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data                   // getter, setter, equals, hashCode, toString 자동 생성
@NoArgsConstructor      // 파라미터 없는 기본 생성자
@AllArgsConstructor     // 모든 필드를 파라미터로 받는 생성자
@Builder      
public class LoginResponseDto {
    private String userId;
    private String email;
    private String userName;
    private String role;
    private boolean success;
    private String message;
}