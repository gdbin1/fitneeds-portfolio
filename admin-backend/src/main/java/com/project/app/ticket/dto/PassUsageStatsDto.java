package com.project.app.ticket.dto;

public record PassUsageStatsDto(
        String statusCd,            // 이용권 상태 코드
        int userCount,              // 해당 상태의 사용자 수
        String chgTypeCd,           // 변동 사유 코드 (PassLogChgTypeCd)
        int totalChgCnt,            // 총 변동 횟수 합계
        double avgDepletionRate     // 평균 소진율 (initCount 대비 사용량)
) {}