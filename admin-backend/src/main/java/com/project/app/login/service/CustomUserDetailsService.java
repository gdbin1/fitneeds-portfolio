package com.project.app.login.service;

import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.project.app.user.entity.User;
import com.project.app.userAdmin.entity.UserAdmin;
import com.project.app.userAdmin.repository.UserAdminRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserAdminRepository userAdminRepository;

    public CustomUserDetailsService(UserAdminRepository userAdminRepository) {
        this.userAdminRepository = userAdminRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // --- 핵심 변경 부분 ---
        // JWT 토큰의 subject("admin")가 loadUserByUsername의 인자 'username'으로 들어옵니다.
        // 우리는 이 'username' 값을 가지고 User 엔티티의 'userId' 필드를 조회해야 합니다.
        UserAdmin user = userAdminRepository.findByUserId(username) // ✨ findByUserId를 사용하여 'username' 인자를 userId로 검색
                .orElseThrow(() -> new UsernameNotFoundException("User not found with userId: " + username));
        // --- 변경 끝 ---

        // DB에서 가져온 사용자의 단일 권한(auth)을 Spring Security의 GrantedAuthority 리스트로 변환
        // Spring Security의 User.builder().roles()는 "ROLE_" 접두사를 자동으로 붙여주지만,
        // List<GrantedAuthority>를 직접 만들 때는 수동으로 "ROLE_"를 붙여주는 것이 좋습니다.
        // 영남님의 Auth 필드가 "ADMIN", "USER" 같은 스트링으로 저장된다고 가정
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole());


        // Spring Security에서 사용하는 UserDetails 객체로 변환하여 반환
        return new org.springframework.security.core.userdetails.User(
                user.getUserId(), // <<< UserDetails의 username으로 사용할 필드는 user.getUserId() (JWT sub와 매칭)
                user.getPassword(), // 암호화된 비밀번호
                Collections.singletonList(authority) // 단일 권한 리스트
        );
    }
}