package com.project.app.schedule.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.project.app.schedule.entity.Schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClosingSoonScheduleResponseDto {

    private Long scheduleId;

    private String branchName;      // 지점명
    private String sportName;       // 종목명
    private String trainerName;     // 강사명

    private LocalDate scheduleDate; // 수업 날짜 (strtDt)
    private LocalTime startTime;    // 시작 시간
    private LocalTime endTime;      // 종료 시간

    private Integer maxCapacity;    // 정원
    private Integer reservedCount;  // 예약 인원
    private Integer remainingSeats; // 남은 좌석 수

    /**
     * Schedule 엔티티를 ClosingSoonScheduleResponseDto로 변환하는 정적 팩토리 메서드
     *
     * @param schedule 스케줄 엔티티
     * @return ClosingSoonScheduleResponseDto
     */
    public static ClosingSoonScheduleResponseDto from(Schedule s) {
        return ClosingSoonScheduleResponseDto.builder()
                .scheduleId(s.getSchdId())
                .branchName(
                        s.getBranch() != null ? s.getBranch().getBrchNm() : null
                )
                .sportName(
                        s.getProgram() != null && s.getProgram().getSportType() != null
                                ? s.getProgram().getSportType().getSportNm()
                                : null
                )
                .trainerName(
                        s.getUserAdmin() != null ? s.getUserAdmin().getUserName() : null
                )
                .scheduleDate(s.getStrtDt())
                .startTime(s.getStrtTm())
                .endTime(s.getEndTm())
                .maxCapacity(s.getMaxNopCnt())
                .reservedCount(s.getRsvCnt())
                .remainingSeats(s.getMaxNopCnt() - s.getRsvCnt())
                .build();
    }
}