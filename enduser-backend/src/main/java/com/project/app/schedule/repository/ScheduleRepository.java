package com.project.app.schedule.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.app.schedule.entity.Schedule;
import com.project.app.schedule.entity.ScheduleSttsCd;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    // --- 종목 ID를 통한 스케줄 조회 (날짜/시간 필터링, 검색어 필터링 포함) ---
    @Query("SELECT s FROM Schedule s " +
            "JOIN s.program p " +
            "JOIN p.sportType st " +
            "JOIN s.userAdmin ua " +
            "JOIN ua.branch b " +
            "WHERE st.sportId = :sportId " +
            "AND s.sttsCd IN :scheduleStatus " +
            "AND (" +
            "    s.strtDt > :currentDate OR " +
            "    (s.strtDt = :currentDate AND s.strtTm > :currentTime)" +
            ") " +
            // --- 날짜 필터 조건 추가 ---
            "AND (:selectedDate IS NULL OR s.strtDt = :selectedDate) " +
            "AND (" +
            "    :searchKeyword IS NULL OR :searchKeyword = '' OR " +
            "    LOWER(p.progNm) LIKE LOWER(CONCAT('%', :searchKeyword, '%')) OR " +
            "    LOWER(ua.userName) LIKE LOWER(CONCAT('%', :searchKeyword, '%')) OR" +
            "    LOWER(b.brchNm) LIKE LOWER(CONCAT('%', :searchKeyword, '%'))" +
            ") " +
            "ORDER BY s.strtDt ASC, s.userAdmin.userId ASC, s.program.progId ASC, s.strtTm ASC, s.endTm ASC")
    List<Schedule> findAvailableSchedulesBySportId(
            @Param("sportId") Long sportId,
            @Param("currentDate") LocalDate currentDate,
            @Param("currentTime") LocalTime currentTime,
            @Param("selectedDate") LocalDate selectedDate,
            @Param("searchKeyword") String searchKeyword,
            @Param("scheduleStatus") List<ScheduleSttsCd> scheduleStatus
    );

    // --- 지점 ID를 통한 스케줄 조회 (날짜/시간 필터링, 검색어 필터링 포함) ---
    @Query("SELECT s FROM Schedule s " +
            "JOIN s.program p " +
            "JOIN s.userAdmin ua " +
            "JOIN ua.branch b " +
            "WHERE b.brchId = :brchId " + 
            "AND s.sttsCd IN :scheduleStatus " +
            "AND (" +
            "    s.strtDt > :currentDate OR " +
            "    (s.strtDt = :currentDate AND s.strtTm > :currentTime)" +
            ") " +
            "AND (:selectedDate IS NULL OR s.strtDt = :selectedDate) " +
            "AND (" +
            "    :searchKeyword IS NULL OR :searchKeyword = '' OR " +
            "    LOWER(p.progNm) LIKE LOWER(CONCAT('%', :searchKeyword, '%')) OR " +
            "    LOWER(ua.userName) LIKE LOWER(CONCAT('%', :searchKeyword, '%')) OR" +
            "    LOWER(b.brchNm) LIKE LOWER(CONCAT('%', :searchKeyword, '%'))" +
            ") " +
            "ORDER BY s.strtDt ASC, s.userAdmin.userId ASC, s.program.progId ASC, s.strtTm ASC, s.endTm ASC")
    List<Schedule> findAvailableSchedulesByBrchId(
            @Param("brchId") Long brchId,
            @Param("currentDate") LocalDate currentDate,
            @Param("currentTime") LocalTime currentTime,
            @Param("selectedDate") LocalDate selectedDate,
            @Param("searchKeyword") String searchKeyword,
            @Param("scheduleStatus") List<ScheduleSttsCd> scheduleStatus
    );

    List<Schedule> findByStrtDtBeforeAndSttsCdIn(LocalDate strtDt, Collection<ScheduleSttsCd> sttsCds);

}