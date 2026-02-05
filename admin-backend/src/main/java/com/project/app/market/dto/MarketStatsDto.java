package com.project.app.market.dto;

import java.math.BigDecimal;

public record MarketStatsDto(
        String sportName,           // 종목명
        long totalPostCount,        // 게시글 수
        long completedTradeCount,   // 완료된 거래 수
        BigDecimal totalTradeAmt,   // 총 거래 금액
        BigDecimal avgTradeAmt,     // 평균 거래가
        double successRate          // 거래 성공률
) {}