package com.project.app.reservation.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservationCreateRequest(
        @NotNull(message = "회원 ID는 필수입니다.")
        String userId,

        @NotNull(message = "스케줄 ID는 필수입니다.")
        Long schdId,

        @NotNull(message = "이용권 ID는 필수입니다.")
        Long passId,

        @NotNull(message = "예약 날짜는 필수입니다.")
        LocalDate rsvDt,

        @NotNull(message = "예약 시간은 필수입니다.")
        LocalTime rsvTime
) {
}

