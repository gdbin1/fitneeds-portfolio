package com.project.app.ticket.service;

import com.project.app.ticket.dto.PassUsageStatsDto;
import com.project.app.ticket.mapper.PassUsageStatsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PassUsageStatsService {

    private final PassUsageStatsMapper passUsageStatsMapper;

    /**
     * 현재 이용권들의 상태별 분포와 평균 소진 속도를 조회합니다.
     */
    public List<PassUsageStatsDto> getStatusStats() {
        return passUsageStatsMapper.selectPassStatusStats();
    }

    /**
     * 특정 기간 동안 발생한 이용권 변동 로그(충전, 차감 등)를 집계합니다.
     */
    public List<PassUsageStatsDto> getLogStats(LocalDate startDate, LocalDate endDate) {
        return passUsageStatsMapper.selectPassLogStats(startDate, endDate);
    }
}