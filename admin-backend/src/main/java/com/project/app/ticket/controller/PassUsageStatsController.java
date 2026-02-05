package com.project.app.ticket.controller;

import com.project.app.ticket.service.PassUsageStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats/pass-usage")
@RequiredArgsConstructor
public class PassUsageStatsController {

    private final PassUsageStatsService passUsageStatsService;

    /**
     * 이용권의 상태별 현황과 로그 분석 결과를 통합하여 반환합니다.
     */
    @GetMapping("/analysis")
    public ResponseEntity<Map<String, Object>> getPassUsageAnalysis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Map<String, Object> result = new HashMap<>();
        // 상태 분포 데이터 추가
        result.put("statusStats", passUsageStatsService.getStatusStats());
        // 변동 로그 통계 데이터 추가
        result.put("logStats", passUsageStatsService.getLogStats(startDate, endDate));

        return ResponseEntity.ok(result);
    }
}