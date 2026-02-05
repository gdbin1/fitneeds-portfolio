package com.project.app.market.mapper;

import com.project.app.market.dto.MarketStatsDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface MarketStatsMapper {
    /**
     * 종목별 양도 거래 현황 집계
     */
    List<MarketStatsDto> selectMarketSummary(@Param("startDate") LocalDate start,
                                             @Param("endDate") LocalDate end);
}