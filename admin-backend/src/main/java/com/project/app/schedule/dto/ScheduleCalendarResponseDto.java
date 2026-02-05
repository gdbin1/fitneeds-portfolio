package com.project.app.schedule.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.project.app.schedule.entity.ScheduleSttsCd;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ScheduleCalendarResponseDto {
	
	private Long schdId;
	private Long brchId;
	
	private Long progId;
	private String progNm;
	
	private String userId;
	
	private LocalDate strtDt;
	private LocalTime strtTm;
	
	private Integer maxNopCnt;
	private Integer rsvCnt;
	
	private ScheduleSttsCd sttsCd;

}
