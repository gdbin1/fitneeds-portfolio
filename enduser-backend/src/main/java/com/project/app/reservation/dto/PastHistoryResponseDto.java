package com.project.app.reservation.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.project.app.reservation.entity.Reservation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PastHistoryResponseDto {

    private Long reservationId;
    private Long scheduleId; // 스케줄 ID (프로그램 상세 페이지 연동용)
    private String sportName;
    private String brchNm;
    private String trainerName;
    private LocalDate rsvDt;
    private LocalTime rsvTime;
    private Long refId;
    private Boolean reviewWritten;
    
    public static PastHistoryResponseDto from(Reservation reservation) {
        if (reservation == null) {
            return null;
        }
        
        return PastHistoryResponseDto.builder()
                .reservationId(reservation.getRsvId())
                .scheduleId(reservation.getSchedule() != null ? reservation.getSchedule().getSchdId() : null)
                .sportName(
                        reservation.getSchedule() != null
                                && reservation.getSchedule().getProgram() != null
                                && reservation.getSchedule().getProgram().getSportType() != null
                                ? reservation.getSchedule().getProgram().getSportType().getSportNm()
                                : null)
                .brchNm(
                        reservation.getBranch() != null
                                ? reservation.getBranch().getBrchNm()
                                : null)
                .trainerName(
                        reservation.getSchedule() != null
                                && reservation.getSchedule().getUserAdmin() != null
                                ? reservation.getSchedule().getUserAdmin().getUserName()
                                : null)
                .rsvDt(reservation.getRsvDt())
                .rsvTime(reservation.getRsvTime())
                .refId(reservation.getRsvId())
                .reviewWritten(reservation.getReviewWritten())
                .build();
    }
}