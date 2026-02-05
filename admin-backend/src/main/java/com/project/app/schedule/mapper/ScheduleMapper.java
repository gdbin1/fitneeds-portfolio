package com.project.app.schedule.mapper;

import com.project.app.schedule.domain.Schedule;
import com.project.app.schedule.dto.ScheduleCalendarResponseDto;
import com.project.app.schedule.dto.ScheduleResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Mapper
public interface ScheduleMapper {
    List<Schedule> findAll();
    List<Schedule> findByBrchId(@Param("brchId") Long brchId);
    List<ScheduleCalendarResponseDto> selectCalendarSchedules(
    		@Param("fromDt") LocalDate fromDt,
    		@Param("toDt") LocalDate toDt,
    		@Param("brchId") Long brchId
    		);
    Schedule findById(@Param("schdId") Long schdId);
    int insert(Schedule schedule);
    int update(Schedule schedule);
    int delete(@Param("schdId") Long schdId);
    List<ScheduleResponse> selectSchedulesByDate(@Param("date") LocalDate date);

    List<LocalDate> selectDistinctScheduleDates();

    List<LocalDate> selectDistinctScheduleDatesBySportId(@Param("sportId") Long sportId);
    
    // 중복 체크: 같은 날짜, 시간, 프로그램, 강사
    int countDuplicate(@Param("progId") Long progId, 
                       @Param("userId") String userId,
                       @Param("strtDt") LocalDate strtDt,
                       @Param("strtTm") LocalTime strtTm,
                       @Param("endTm") LocalTime endTm,
                       @Param("excludeSchdId") Long excludeSchdId);
}
