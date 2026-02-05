package com.project.app.schedule.controller;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.app.schedule.dto.ClosingSoonScheduleResponseDto;
import com.project.app.schedule.service.ClosingSoonScheduleService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 마감 임박 스케줄 관련 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ClosingSoonScheduleController {

    private final ClosingSoonScheduleService closingSoonScheduleService;

    /**
     * 마감일이 하루 남고 예약 가능한 인원이 남은 스케줄 목록을 조회합니다.
     *
     * GET /api/schedules/closingSoon?date=2025-12-25&branchId=1
     *
     * @param dateStr 조회 기준 날짜 (선택사항, 형식: yyyy-MM-dd, 기본값: 오늘)
     * @param branchId 지점 ID (선택사항)
     * @return 마감 임박 스케줄 목록 응답
     */
    @GetMapping("/closingSoon")
    public ResponseEntity<Map<String, Object>> getClosingSoonSchedules(
            @RequestParam(value = "date", required = false) String dateStr,
            @RequestParam(value = "branchId", required = false) Long branchId) {
        try {
            // 날짜 파싱 (기본값: 오늘)
            LocalDate baseDate;
            if (dateStr != null && !dateStr.isEmpty()) {
                try {
                    baseDate = LocalDate.parse(dateStr);
                } catch (DateTimeParseException e) {
                    log.warn("[ClosingSoonScheduleController] 잘못된 날짜 형식 - date: {}", dateStr);
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("resultCode", "BAD_REQUEST");
                    errorResponse.put("message", "날짜 형식이 올바르지 않습니다. (형식: yyyy-MM-dd)");
                    errorResponse.put("data", null);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
                }
            } else {
                baseDate = LocalDate.now();
            }

            log.info("[ClosingSoonScheduleController] 마감 임박 스케줄 조회 요청 - baseDate: {}, branchId: {}", baseDate, branchId);

            // Service 호출
            List<ClosingSoonScheduleResponseDto> schedules = closingSoonScheduleService.getClosingSoonSchedules(baseDate, branchId);

            // 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", "SUCCESS");
            response.put("message", "조회 성공");
            response.put("data", schedules);

            log.info("[ClosingSoonScheduleController] 마감 임박 스케줄 조회 완료 - 개수: {}", schedules.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("[ClosingSoonScheduleController] 마감 임박 스케줄 조회 중 오류 발생", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", "ERROR");
            errorResponse.put("message", "마감 임박 스케줄 조회 중 오류가 발생했습니다: " + e.getMessage());
            errorResponse.put("data", null);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}