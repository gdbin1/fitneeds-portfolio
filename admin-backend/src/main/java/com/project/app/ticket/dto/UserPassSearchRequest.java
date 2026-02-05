package com.project.app.ticket.dto;

import com.project.app.global.dto.BasePagingRequest;

public record UserPassSearchRequest(
        String userId,      // 특정 회원 조회용 (추가)
        String username,
        String sportName,
        String status,
        BasePagingRequest paging
) {
    // 기존 코드 호환성을 위한 생성자
    public UserPassSearchRequest(String username, String sportName, String status) {
        this(null, username, sportName, status, null);
    }

    public UserPassSearchRequest {
        if (paging == null) {
            paging = new BasePagingRequest(1, 10, null, "DESC");
        }
    }
}
