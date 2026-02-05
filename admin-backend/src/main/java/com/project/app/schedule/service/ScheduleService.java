package com.project.app.schedule.service;

import com.project.app.schedule.domain.Schedule;
import com.project.app.schedule.dto.ScheduleCalendarResponseDto;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleService {
    List<Schedule> findAll();
    List<Schedule> findByBrchId(Long brchId);
    List<ScheduleCalendarResponseDto> selectCalendarSchedules(LocalDate fromDt, LocalDate toDt, Long brchId);
    Schedule findById(Long schdId);
    Schedule create(Schedule schedule);
    Schedule update(Schedule schedule);
    void delete(Long schdId);
}
