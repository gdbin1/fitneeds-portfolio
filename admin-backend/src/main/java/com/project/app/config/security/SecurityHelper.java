package com.project.app.config.security;

import com.project.app.userAdmin.entity.UserAdmin;
import com.project.app.userAdmin.repository.UserAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Security Context에서 현재 인증된 관리자 정보를 조회하는 헬퍼 클래스
 */
@Component
@RequiredArgsConstructor
public class SecurityHelper {

    private final UserAdminRepository userAdminRepository;

    /**
     * 현재 인증된 관리자의 userId를 반환
     *
     * @return 인증된 관리자의 userId (없으면 null)
     */
    public String getCurrentAdminUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        return authentication.getName(); // JWT에서 추출한 userId
    }

    /**
     * 현재 인증된 관리자의 UserAdmin 엔티티를 반환
     *
     * @return UserAdmin 엔티티 (없으면 null)
     */
    public UserAdmin getCurrentAdminOrNull() {
        String userId = getCurrentAdminUserId();
        if (userId == null) {
            return null;
        }
        return userAdminRepository.findByUserId(userId).orElse(null);
    }

    /**
     * 현재 인증된 관리자의 UserAdmin 엔티티를 반환 (필수)
     *
     * @return UserAdmin 엔티티
     * @throws IllegalStateException 인증되지 않았거나 관리자를 찾을 수 없는 경우
     */
    public UserAdmin getCurrentAdmin() {
        UserAdmin admin = getCurrentAdminOrNull();
        if (admin == null) {
            throw new IllegalStateException("인증된 관리자를 찾을 수 없습니다.");
        }
        return admin;
    }
}

