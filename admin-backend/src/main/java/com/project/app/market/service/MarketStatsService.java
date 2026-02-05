package com.project.app.market.service;

import com.project.app.market.dto.MarketStatsDto;
import com.project.app.market.mapper.MarketStatsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MarketStatsService {

    private final MarketStatsMapper marketStatsMapper;

    /**
     * 특정 기간 동안의 종목별 양도 거래 요약 정보를 조회합니다.
     */
    public List<MarketStatsDto> getMarketSummary(LocalDate startDate, LocalDate endDate) {
        // XML Mapper의 selectMarketSummary 쿼리를 호출합니다.
        return marketStatsMapper.selectMarketSummary(startDate, endDate);
    }
}