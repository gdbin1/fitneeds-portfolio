package com.project.app.reservation.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReservationRequestDto {

    private Long schdId; // 스케줄 ID (필수)
    private Long userPassId; // 이용권 ID (선택사항, null이면 단건 결제)
    private LocalDate rsvDt; // 예약 날짜 (필수)
    private LocalTime rsvTime; // 예약 시간 (필수)
}