package com.project.app.reservation.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReservationResponseDto {

    private Long rsvId;
    private String sttsCd;
    private LocalDate rsvDt;
    private LocalTime rsvTime;
    private LocalDateTime regDt;
    private LocalDateTime updDt;
    private String cnclRsn;
    private String updId;

    private String userId;
    private String userName;
    private String email;

    private Long schdId;
    private String schdNm;

    private LocalDate strtDt;
    private LocalDate endDt;
    private LocalTime strtTm;
    private LocalTime endTm;
    private Integer maxNopcnt;
    private Integer rsvCnt;
    private String SchdSttsCd;
    private String description;

    private String instructorId;
}