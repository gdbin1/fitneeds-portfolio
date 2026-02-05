package com.project.app.reservation.dto;

public record ReservationStatsDto(
        String branchName,          // 지점명
        String sttsCd,              // 예약 상태 (ATTENDED, ABSENT 등)
        long rsvCount,              // 예약 건수
        int rsvHour,                // 시간대
        double attendanceRate,      // 출석률
        long reviewCount            // 리뷰 작성 건수
) {}