package com.project.app.schedule.service;

import com.project.app.schedule.domain.Schedule;
import com.project.app.schedule.dto.ScheduleCalendarResponseDto;
import com.project.app.schedule.mapper.ScheduleMapper;
import com.project.app.schedule.entity.ScheduleSttsCd;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleServiceImpl implements ScheduleService {
    
    private final ScheduleMapper scheduleMapper;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    @Override
    public List<Schedule> findAll() {
        return scheduleMapper.findAll();
    }
    
    @Override
    public List<Schedule> findByBrchId(Long brchId) {
    	return scheduleMapper.findByBrchId(brchId);
    }
    
    @Override
    public List<ScheduleCalendarResponseDto> selectCalendarSchedules(
    		LocalDate fromDt,
    		LocalDate toDt,
    		Long brchId
    		) {
    	return scheduleMapper.selectCalendarSchedules(fromDt, toDt, brchId);
    }
    
    @Override
    public Schedule findById(Long schdId) {
        return scheduleMapper.findById(schdId);
    }
    
    @Override
    public Schedule create(Schedule schedule) {
        // String -> LocalType 변환
        LocalDate strtDt = schedule.getStrtDt();
        LocalTime strtTm = schedule.getStrtTm();
        LocalTime endTm = schedule.getEndTm();

        // 중복 체크: 같은 날짜, 시간, 프로그램, 강사
        int duplicateCount = scheduleMapper.countDuplicate(
            schedule.getProgId(),
            schedule.getUserId(),
            strtDt,
            strtTm,
            endTm,
            null // 새로 생성하는 경우이므로 제외할 ID 없음
        );
        
        if (duplicateCount > 0) {
            throw new IllegalStateException("같은 날짜, 같은 시간에 이미 등록된 스케줄이 있습니다.");
        }
        
        // 기본값 설정
        if (schedule.getRsvCnt() == null) {
            schedule.setRsvCnt(0);
        }
        if (schedule.getSttsCd() == null) {
            schedule.setSttsCd(ScheduleSttsCd.AVAILABLE);
        }
        if (schedule.getRegDt() == null) {
            schedule.setRegDt(LocalDateTime.now().format(DATETIME_FORMATTER));
        }
        if (schedule.getUpdDt() == null) {
            schedule.setUpdDt(LocalDateTime.now().format(DATETIME_FORMATTER));
        }
        scheduleMapper.insert(schedule);
        return schedule;
    }
    
    @Override
    public Schedule update(Schedule schedule) {
        // String -> LocalType 변환
        LocalDate strtDt = schedule.getStrtDt();
        LocalTime strtTm = schedule.getStrtTm();
        LocalTime endTm = schedule.getEndTm();

        // 중복 체크: 같은 날짜, 시간, 프로그램, 강사 (현재 스케줄 제외)
        int duplicateCount = scheduleMapper.countDuplicate(
            schedule.getProgId(),
            schedule.getUserId(),
            strtDt,
            strtTm,
            endTm,
            schedule.getSchdId() // 현재 수정 중인 스케줄은 제외
        );
        
        if (duplicateCount > 0) {
            throw new IllegalStateException("같은 날짜, 같은 시간에 이미 등록된 스케줄이 있습니다.");
        }
        
        // 업데이트 시간 자동 설정
        schedule.setUpdDt(LocalDateTime.now().format(DATETIME_FORMATTER));
        
        scheduleMapper.update(schedule);
        return schedule;
    }
    
    private LocalTime parseTime(String timeStr) {
        if (timeStr == null || timeStr.isEmpty()) return null;
        if (timeStr.length() == 5) { // HH:mm
            return LocalTime.parse(timeStr + ":00", TIME_FORMATTER);
        }
        return LocalTime.parse(timeStr, TIME_FORMATTER);
    }

    @Override
    public void delete(Long schdId) {
        scheduleMapper.delete(schdId);
    }
}
