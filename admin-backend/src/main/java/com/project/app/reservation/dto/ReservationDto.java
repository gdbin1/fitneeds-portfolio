package com.project.app.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDto {
    private Long rsvId;
    private String userId;
    private String userName;
    private String phoneNumber;
    private String sttsCd;
    private LocalDate rsvDt;
    private LocalTime rsvTime;
}
