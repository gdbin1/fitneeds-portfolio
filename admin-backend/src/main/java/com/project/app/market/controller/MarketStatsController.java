package com.project.app.market.controller;

import com.project.app.market.dto.MarketStatsDto;
import com.project.app.market.service.MarketStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/stats/market")
@RequiredArgsConstructor
public class MarketStatsController {

    private final MarketStatsService marketStatsService;

    /**
     * 종목별 거래 통계 데이터를 반환합니다.
     */
    @GetMapping("/summary")
    public ResponseEntity<List<MarketStatsDto>> getMarketSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(marketStatsService.getMarketSummary(startDate, endDate));
    }
}