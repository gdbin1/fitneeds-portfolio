package com.project.app.schedule.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.app.schedule.entity.Schedule;

@Repository
public interface ClosingSoonScheduleRepository extends JpaRepository<Schedule, Long> {

    /**
     * 마감일이 하루 남고 예약 가능한 인원이 남은 스케줄 목록을 조회합니다.
     *
     * @param targetDate 마감일 (기준 날짜 + 1일)
     * @param branchId 지점 ID (선택사항, null이면 전체)
     * @return 마감 임박 스케줄 목록
     */
    @Query("SELECT s FROM Schedule s " +
            "LEFT JOIN FETCH s.program p " +
            "LEFT JOIN FETCH p.sportType st " +
            "LEFT JOIN FETCH s.userAdmin ua " +
            "LEFT JOIN FETCH ua.branch " +
            "WHERE s.strtDt = :targetDate " +
            "AND s.rsvCnt < s.maxNopCnt " +
            "AND (:branchId IS NULL OR ua.branch.brchId = :branchId) " +
            "ORDER BY s.strtDt ASC, s.endTm ASC")
    List<Schedule> findClosingSoonSchedules(
            @Param("targetDate") LocalDate targetDate,
            @Param("branchId") Long branchId);
}