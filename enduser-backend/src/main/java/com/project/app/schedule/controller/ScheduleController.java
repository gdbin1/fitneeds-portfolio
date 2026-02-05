package com.project.app.schedule.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.app.aspect.ApiResponse;
import com.project.app.schedule.dto.GroupedScheduleResponseDto;
import com.project.app.schedule.dto.ScheduleResponseDto;
import com.project.app.schedule.entity.Schedule;
import com.project.app.schedule.service.ScheduleService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
@Slf4j
public class ScheduleController {

    private final ScheduleService scheduleService;

	/**
     * 특정 운동 종목 ID에 해당하는 수업 스케줄 목록을 조회합니다.
     * 검색 키워드, 선택 날짜를 기준으로 필터링하며 페이징 처리된 결과를 반환합니다.
     * 지난 수업은 제외하고 현재 시간 이후의 스케줄을 우선적으로 보여줍니다.
     *
     * @param sportId       조회할 운동 종목의 고유 ID
     * @param searchKeyword 강사명 또는 프로그램명 검색어 (선택 사항)
     * @param selectedDate  특정 날짜의 스케줄을 보고 싶을 때 입력 (선택 사항)
     * @param pageable      페이징 정보 (기본 페이지 당 10개)
     * @return 페이징 처리된 스케줄 정보 (성공 시 200, 오류 시 500)
     */
	@GetMapping("/getSchedulesBySportIdForR/{sportId}")
	public ResponseEntity<ApiResponse<Page<GroupedScheduleResponseDto>>> getSchedulesBySportIdForR(@PathVariable("sportId") Long sportId,
			@RequestParam(value = "searchKeyword", required = false) String searchKeyword,
			@RequestParam(value = "selectedDate", required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate selectedDate,
			@PageableDefault(size = 10) Pageable pageable) {
		try {
			LocalDate currentDate = LocalDate.now();
			LocalTime currentTime = LocalTime.now();
			
			Page<GroupedScheduleResponseDto> result = scheduleService.getSchedulesBySportIdForR(sportId, searchKeyword, currentDate, currentTime,selectedDate, pageable);
			log.info("API 호출: /getSchedulesBySportIdForR/{}. sportId={}, searchKeyword={}, pageable={}", sportId,searchKeyword, pageable);
			return ResponseEntity.ok(ApiResponse.success(result));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("조회 중 오류 발생: " + e.getMessage()));
		}
	}

	/**
     * 특정 지점 ID에 해당하는 수업 스케줄 목록을 조회합니다.
     * 지점 내 프로그램명이나 강사명으로 검색이 가능하며, 선택한 날짜의 일정만 필터링할 수 있습니다.
     * 페이징 처리가 되어 있으며, 현재 시간 이후의 데이터를 우선적으로 제공합니다.
     *
     * @param brchId        조회할 지점의 고유 ID
     * @param searchKeyword 강사명 또는 프로그램명 검색어 (선택 사항)
     * @param selectedDate  조회하고자 하는 특정 날짜 (선택 사항)
     * @param pageable      페이징 및 정렬 정보 (기본 페이지 당 10개)
     * @return 페이징 처리된 지점별 스케줄 정보 (성공 시 200, 오류 시 500)
     */
	@GetMapping("/getSchedulesByBrchIdForR/{brchId}")
	public ResponseEntity<ApiResponse<Page<GroupedScheduleResponseDto>>> getSchedulesByBrchIdForR(@PathVariable("brchId") Long brchId,
			@RequestParam(value = "searchKeyword", required = false) String searchKeyword,
			@RequestParam(value = "selectedDate", required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate selectedDate,
			@PageableDefault(size = 10) Pageable pageable) {
		
		try {
			LocalDate currentDate = LocalDate.now();
			LocalTime currentTime = LocalTime.now();
			
			Page<GroupedScheduleResponseDto> result = scheduleService.getSchedulesByBrchIdForR(brchId, searchKeyword, currentDate, currentTime, selectedDate, pageable);
			log.info("API 호출: /getSchedulesByBrchIdForR/{}. brchId={}, searchKeyword={}, pageable={}", brchId,
					searchKeyword, pageable);
			
			return ResponseEntity.ok(ApiResponse.success(result));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("조회 중 오류 발생: " + e.getMessage()));
		}
	}
}
