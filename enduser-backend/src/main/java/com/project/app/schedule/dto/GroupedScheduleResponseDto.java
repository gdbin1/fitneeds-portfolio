package com.project.app.schedule.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import com.project.app.schedule.entity.Schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Slf4j
public class GroupedScheduleResponseDto {

	// 그룹의 기준이 되는 대표 정보들
    private String userId;      // 강사 ID
    private String userName;    // 강사 이름
    private Long progId;        // 프로그램 ID
    private String progNm;      // 프로그램 명
    private String brchNm;      // 지점 명
    private String sttsCd;      // 상태 (대표 상태)

    private LocalTime strtTm;   // 시작 시간
    private LocalTime endTm;     // 종료 시간

    private LocalDate groupedStrtDt; // 그룹화된 일정의 시작일
    private LocalDate groupedEndDt;  // 그룹화된 일정의 종료일
    
    @Builder.Default
    private List<ScheduleSessionDto> sessions = new ArrayList<>();

    /**
     * 날짜와 스케줄 ID를 쌍으로 묶어서 전달하기 위한 내부 DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScheduleSessionDto {
        private Long schdId;
        private LocalDate date;
    }
    
 // 기존 생성자 유지 (필요에 따라 수정 가능)
    public GroupedScheduleResponseDto(String userId, String userName, Long progId, String progNm,
            String brchNm, LocalTime strtTm, LocalTime endTm, LocalDate groupedStrtDt, LocalDate groupedEndDt) {
        this.userId = userId;
        this.userName = userName;
        this.progId = progId;
        this.progNm = progNm;
        this.brchNm = brchNm;
        this.strtTm = strtTm;
        this.endTm = endTm;
        this.groupedStrtDt = groupedStrtDt;
        this.groupedEndDt = groupedEndDt;
        this.sessions = new ArrayList<>();
    }
    
    /**
     * Schedule 엔티티 하나를 바탕으로 기본 DTO 객체를 생성하는 정적 팩토리 메서드
     */
    public static GroupedScheduleResponseDto from(Schedule schedule) {
        if (schedule.getUserAdmin() == null) {
            log.error("Schedule (schdId={}) has null UserAdmin.", schedule.getSchdId());
        }
        if (schedule.getProgram() == null) {
            log.error("Schedule (schdId={}) has null Program.", schedule.getSchdId());
        }

        return GroupedScheduleResponseDto.builder()
                .userId(schedule.getUserAdmin().getUserId())
                .userName(schedule.getUserAdmin().getUserName())
                .progId(schedule.getProgram().getProgId())
                .progNm(schedule.getProgram().getProgNm())
                .brchNm(schedule.getUserAdmin().getBranch().getBrchNm())
                .strtTm(schedule.getStrtTm())
                .endTm(schedule.getEndTm())
                .sttsCd(schedule.getSttsCd().name())
                .groupedStrtDt(schedule.getStrtDt())
                .groupedEndDt(schedule.getStrtDt())
                .sessions(new ArrayList<>()) // 빈 리스트로 초기화 후 서비스 레이어에서 addSession 진행
                .build();
    }
    
    /**
     * 특정 날짜의 세션을 리스트에 추가하는 편의 메서드
     */
    public void addSession(Long schdId, LocalDate date) {
        if (this.sessions == null) {
            this.sessions = new ArrayList<>();
        }
        this.sessions.add(new ScheduleSessionDto(schdId, date));
    }
}
