package com.project.app.ticket.dto;

import com.project.app.ticket.entity.UserPass;

import java.time.LocalDateTime;
import java.util.List;

public record UserPassResponse(
        Long passId,
        String userName,      // 회원 이름 (Join)
        Long sportId,         // 종목 ID (추가: 프론트에서 날짜 필터링용)
        String sportName,     // 스포츠 종목 이름 (Join)
        String passStatusCode,   // 상태
        Integer remainingCount,       // 잔여 횟수
        LocalDateTime regDt,
        LocalDateTime lastChgDt,// 등록일
        List<PassLogResponse> histories  // 변동 이력 목록 (상세 조회 시)
) {
    // 목록 조회용 생성자 (histories 없이)
    public UserPassResponse(Long passId, String userName, Long sportId, String sportName,
                            String passStatusCode, Integer remainingCount, LocalDateTime regDt, LocalDateTime lastChgDt) {
        this(passId, userName, sportId, sportName, passStatusCode, remainingCount, regDt, lastChgDt, null);
    }

    //DTO 변환 팩토리 메서드
    public static UserPassResponse of(UserPass userPass, List<PassLogResponse> histories) {
        return new UserPassResponse(
                userPass.getPassId(),
                userPass.getUser().getUserName(), // Lazy Loading 주의
                userPass.getSport().getSportId(), // 추가
                userPass.getSport().getSportNm(),
                userPass.getPassStatusCode() != null ? userPass.getPassStatusCode().name() : null,
                userPass.getRemainingCount(),
                userPass.getRegDt(),
                userPass.getUpdDt(),
                histories
        );
    }
}
