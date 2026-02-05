package com.project.app.login.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDto {
    private String userId;
    private String email;
    private String userName;
    private String role;
    private boolean success;
    private String message;
    private Long brchId;
}
