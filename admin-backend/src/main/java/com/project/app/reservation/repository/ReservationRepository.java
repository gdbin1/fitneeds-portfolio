package com.project.app.reservation.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.project.app.reservation.dto.ReservationDto;
import com.project.app.reservation.entity.Reservation;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservationRepository
        extends JpaRepository<Reservation, Long> {

    // 예약 목록과 사용자 정보를 직접 조인해서 DTO로 반환
    @Query("SELECT new com.project.app.reservation.dto.ReservationDto(" +
           "r.rsvId, r.user.userId, u.userName, u.phoneNumber, " +
           "r.sttsCd, r.rsvDt, r.rsvTime) " +
           "FROM Reservation r " +
           "JOIN r.user u " +
           "WHERE r.schedule.schdId = :schdId")
    List<ReservationDto> findReservationDtosBySchdId(@Param("schdId") Long schdId);

    // 기존 메서드 유지 (특정 스케줄의 예약 목록 조회)
    List<Reservation> findBySchedule_SchdId(Long scheduleId);

    /**
     * 특정 사용자의 예약 목록 조회
     */
    List<Reservation> findByUser_UserId(String userId);

    /**
     * 특정 상태의 예약 목록 조회
     */
    List<Reservation> findBySttsCd(String statusCode);

    /**
     * 특정 지점의 예약 목록 조회
     */
    List<Reservation> findByBranch_BrchId(Long branchId);

    /**
     * 특정 이용권의 예약 목록 조회
     */
    List<Reservation> findByPass_PassId(Long passId);

    /**
     * 예약 시간으로 예약 조회 (중복 예약 확인용)
     */
    Optional<Reservation> findBySchedule_SchdIdAndRsvTimeAndSttsCd(Long scheduleId, LocalDateTime rsvTime, String statusCode);

    /**
     * 사용자의 특정 상태 예약 목록 조회
     */
    List<Reservation> findByUser_UserIdAndSttsCd(String userId, String statusCode);
}
