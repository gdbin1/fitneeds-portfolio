package com.project.app.schedule.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.project.app.schedule.entity.Schedule;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ScheduleResponseDto {

    private Long schdId;
    private LocalDate strtDt;
    private LocalTime strtTm;
    private LocalTime endTm;
    private Integer maxNopCnt;
    private Integer rsvCnt;
    private String sttsCd;
    private String description;
    private LocalDateTime regDt;
    private LocalDateTime updDt;

    private Long progId;
    private String progNm;
    private boolean progUseYn;
    private BigDecimal oneTimeAmt;
    private Integer rwdGamePnt;

    private Long sportId;
    private String sportNm;
    private String sportMemo;
    private boolean sportUseYn;

    private String userId;
    private String userName;
    private String email;
    private String phoneNumber;

    private Long brchId;
    private String brchNm;
    private String addr;
    private boolean operYn;

    public static ScheduleResponseDto from (Schedule schedule) {
        return ScheduleResponseDto.builder()
                .schdId(schedule.getSchdId())
                .strtDt(schedule.getStrtDt())
                .strtTm(schedule.getStrtTm())
                .endTm(schedule.getEndTm())
                .maxNopCnt(schedule.getMaxNopCnt())
                .rsvCnt(schedule.getRsvCnt())
                .description(schedule.getDescription())
                .regDt(schedule.getRegDt())
                .updDt(schedule.getUpdDt())
                .progId(schedule.getProgram().getProgId())
                .progNm(schedule.getProgram().getProgNm())
                .progUseYn(schedule.getProgram().isUseYn())
                .oneTimeAmt(schedule.getProgram().getOneTimeAmt())
//                .rwdGamePnt(schedule.getProgram().getRwdGamePnt())
                .sportId(schedule.getProgram().getSportType().getSportId())
                .sportNm(schedule.getProgram().getSportType().getSportNm())
                .sportMemo(schedule.getProgram().getSportType().getSportMemo())
                .sportUseYn(schedule.getProgram().getSportType().isUseYn())
                .userId(schedule.getUserAdmin().getUserId())
                .userName(schedule.getUserAdmin().getUserName())
                .email(schedule.getUserAdmin().getEmail())
                .phoneNumber(schedule.getUserAdmin().getPhoneNumber())
                .brchId(schedule.getUserAdmin().getBranch().getBrchId())
                .brchNm(schedule.getUserAdmin().getBranch().getBrchNm())
                .addr(schedule.getUserAdmin().getBranch().getAddr())
                .operYn(schedule.getUserAdmin().getBranch().isOperYn())
                .build();
    }
}