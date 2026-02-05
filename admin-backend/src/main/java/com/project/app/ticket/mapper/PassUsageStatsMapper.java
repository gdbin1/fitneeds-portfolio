package com.project.app.ticket.mapper;

import com.project.app.ticket.dto.PassUsageStatsDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface PassUsageStatsMapper {
    /**
     * 이용권 상태 분포 조회
     */
    List<PassUsageStatsDto> selectPassStatusStats();

    /**
     * 이용권 변동 로그(충전, 차감 등) 분석
     */
    List<PassUsageStatsDto> selectPassLogStats(@Param("startDate") LocalDate start,
                                               @Param("endDate") LocalDate end);
}