package com.project.app.schedule.service;

import com.project.app.schedule.dto.ScheduleResponse;
import com.project.app.schedule.mapper.ScheduleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminScheduleService {

    private final ScheduleMapper scheduleMapper;

    /**
     * 달력 표시용 - 스케줄이 존재하는 날짜 리스트
     *
     * @param sportId 종목 ID (null이면 전체, 지정되면 해당 종목만 필터링)
     * @return 중복 없는 날짜 목록
     */
    public List<LocalDate> getScheduledDates(Long sportId) {
        if (sportId == null) {
            return scheduleMapper.selectDistinctScheduleDates();
        }
        return scheduleMapper.selectDistinctScheduleDatesBySportId(sportId);
    }

    /**
     * 특정 날짜의 스케줄 리스트 (드롭다운용)
     *
     * @param date 조회할 날짜
     * @return 해당 날짜의 스케줄 목록
     */
    public List<ScheduleResponse> getSchedulesByDate(LocalDate date) {
        return scheduleMapper.selectSchedulesByDate(date);
    }
}
