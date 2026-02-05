package com.project.app.reservation.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.project.app.reservation.entity.AttendanceStatus;
import com.project.app.reservation.entity.Reservation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyReservationResponseDto {

    private Long reservationId;
    private String sportName;
    private String brchNm;
    private String trainerName;
    private LocalDate rsvDt;
    private LocalTime rsvTime;
    private AttendanceStatus attendanceStatus;

    /**
     * Reservation 엔티티를 MyReservationResponseDto로 변환하는 정적 팩토리 메서드
     *
     * @param reservation 예약 엔티티
     * @return MyReservationResponseDto
     */
    public static MyReservationResponseDto from(Reservation reservation) {
        if (reservation == null) {
            return null;
        }

        return MyReservationResponseDto.builder()
                .reservationId(reservation.getRsvId())
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
                .attendanceStatus(reservation.getAttendanceStatus())
                .build();
    }
}