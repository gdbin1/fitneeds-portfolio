package com.project.app.schedule.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.app.schedule.dto.ClosingSoonScheduleResponseDto;
import com.project.app.schedule.entity.Schedule;
import com.project.app.schedule.repository.ClosingSoonScheduleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClosingSoonScheduleService {

    private final ClosingSoonScheduleRepository closingSoonScheduleRepository;

    /**
     * 마감일이 하루 남고 예약 가능한 인원이 남은 스케줄 목록을 조회합니다.
     *
     * @param baseDate 조회 기준 날짜 (기본값: 오늘)
     * @param branchId 지점 ID (선택사항)
     * @return 마감 임박 스케줄 목록 DTO
     */
    @Transactional(readOnly = true)
    public List<ClosingSoonScheduleResponseDto> getClosingSoonSchedules(LocalDate baseDate, Long branchId) {
        log.info("[ClosingSoonScheduleService] 마감 임박 스케줄 조회 시작 - baseDate: {}, branchId: {}", baseDate, branchId);

        // 마감일 계산 (기준 날짜의 다음 날)
        LocalDate targetDate = baseDate.plusDays(1);
        log.info("[ClosingSoonScheduleService] 마감일: {}", targetDate);

        try {
            // Repository에서 조회
            List<Schedule> schedules = closingSoonScheduleRepository.findClosingSoonSchedules(targetDate, branchId);

            log.info("[ClosingSoonScheduleService] 조회된 스케줄 개수: {}", schedules.size());

            // DTO 변환
            List<ClosingSoonScheduleResponseDto> result = schedules.stream()
                    .map(ClosingSoonScheduleResponseDto::from)
                    .collect(Collectors.toList());

            return result;

        } catch (Exception e) {
            log.error("[ClosingSoonScheduleService] 마감 임박 스케줄 조회 중 오류 발생", e);
            throw e;
        }
    }
}