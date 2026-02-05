package com.project.app.login.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.app.login.dto.LoginRequestDto;
import com.project.app.login.dto.LoginResponseDto;
import com.project.app.user.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class LoginService {

    @Autowired
    private UserRepository userRepository;
    
    public LoginResponseDto login(LoginRequestDto loginRequestDto) {
        return userRepository.findByUserId(loginRequestDto.getUserId())
                .filter(user -> user.getPassword().equals(loginRequestDto.getPassword()))
                .map(user -> LoginResponseDto.builder()
                        .userId(user.getUserId())
                        .email(user.getEmail())
                        .userName(user.getUserName())
                        .role(user.getRole())
                        .success(true)
                        .message("로그인 성공")
                        .build())
                .orElse(LoginResponseDto.builder()
                        .success(false)
                        .message("이메일 또는 비밀번호가 일치하지 않습니다.")
                        .build());
    }
}