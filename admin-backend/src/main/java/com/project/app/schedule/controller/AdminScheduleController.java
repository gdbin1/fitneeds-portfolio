package com.project.app.schedule.controller;

import com.project.app.schedule.dto.ScheduleResponse;
import com.project.app.schedule.service.AdminScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "[관리자] 스케줄 조회", description = "스케줄 날짜 및 상세 조회 API")
@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class AdminScheduleController {

    private final AdminScheduleService scheduleService;

    @Operation(summary = "스케줄 존재 날짜 목록", description = "달력에 표시할 스케줄이 있는 날짜 목록을 반환합니다. (선택사항: sportId로 특정 종목만 필터링)")
    @GetMapping("/dates")
    public ResponseEntity<List<LocalDate>> getDates(
            @RequestParam(required = false) Long sportId // 종목별 필터링 (선택사항)
    ) {
        return ResponseEntity.ok(scheduleService.getScheduledDates(sportId));
    }

    @Operation(summary = "특정 날짜의 스케줄 목록", description = "선택한 날짜의 스케줄 목록을 반환합니다. (프로그램명, 강사명 포함)")
    @GetMapping
    public ResponseEntity<List<ScheduleResponse>> getSchedules(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(scheduleService.getSchedulesByDate(date));
    }
}

