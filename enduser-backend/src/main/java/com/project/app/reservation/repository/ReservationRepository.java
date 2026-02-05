package com.project.app.reservation.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.app.reservation.entity.Reservation;
import com.project.app.reservation.entity.RsvSttsCd;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.app.reservation.entity.Reservation;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

	List<Reservation> findByRsvDtBeforeAndSttsCd(LocalDate rsvDt, RsvSttsCd sttsCd);
	/**
	 * 사용자 ID로 예약 목록을 조회합니다.
	 * Fetch Join을 사용하여 N+1 문제를 방지하고, 연관된 엔티티들을 한 번에 로딩합니다.
	 * 
	 * @param userId 사용자 ID
	 * @return 예약 목록 (최신순 정렬)
	 */
	@Query("SELECT r FROM Reservation r " +
			"JOIN FETCH r.schedule s " +
			"JOIN FETCH s.program p " +
			"JOIN FETCH p.sportType st " +
			"JOIN FETCH s.userAdmin ua " +
			"LEFT JOIN FETCH ua.branch " +
			"JOIN FETCH r.branch " +
			"WHERE r.user.userId = :userId " +
			"AND r.sttsCd = RsvSttsCd.CONFIRMED " +
			"ORDER BY r.rsvDt DESC, r.rsvTime DESC")
	List<Reservation> findByUserIdWithDetails(@Param("userId") String userId);

	/**
	 * 예약 ID와 사용자 ID로 예약을 조회합니다.
	 * 취소 시 권한 체크를 위해 사용됩니다.
	 * 
	 * @param rsvId 예약 ID
	 * @param userId 사용자 ID
	 * @return 예약 엔티티 (Optional)
	 */
	@Query("SELECT r FROM Reservation r " +
			"JOIN FETCH r.schedule s " +
			"JOIN FETCH r.branch " +
			"LEFT JOIN FETCH r.userPass up " +
			"WHERE r.rsvId = :rsvId AND r.user.userId = :userId")
	Optional<Reservation> findByRsvIdAndUserId(
			@Param("rsvId") Long rsvId,
			@Param("userId") String userId);

	/**
	 * 날짜가 지난 예약 목록을 조회합니다.
	 * 예약 완료 처리 시 사용됩니다.
	 * 
	 * @param targetDate 기준 날짜 (이 날짜보다 이전 예약 조회)
	 * @return 날짜가 지난 예약 목록
	 */
	@Query("SELECT r FROM Reservation r " +
			"JOIN FETCH r.schedule s " +
			"JOIN FETCH s.program p " +
			"JOIN FETCH p.sportType st " +
			"JOIN FETCH s.userAdmin ua " +
			"LEFT JOIN FETCH ua.branch " +
			"JOIN FETCH r.branch " +
			"JOIN FETCH r.user u " +
			"LEFT JOIN FETCH r.userPass up " +
			"WHERE r.rsvDt < :targetDate " +
			"AND r.sttsCd = 'RESERVED' " +
			"ORDER BY r.rsvDt ASC, r.rsvTime ASC")
	List<Reservation> findPastReservations(@Param("targetDate") LocalDate targetDate);

	// 1. 특정 스케줄에 해당 유저가 이미 예약했는지 확인 (취소된 예약 제외)
    boolean existsByUser_UserIdAndSchedule_SchdIdAndSttsCd(String userId, Long schdId, RsvSttsCd sttsCd);
    
    // 2. 특정 날짜와 시간에 해당 유저의 예약이 이미 존재하는지 확인 (취소된 예약 제외)
    boolean existsByUser_UserIdAndRsvDtAndRsvTimeAndSttsCd(String userId, LocalDate rsvDt, LocalTime rsvTime, RsvSttsCd sttsCd);
    
    // 3. 사용자 ID와 상태로 예약 목록 조회 (리뷰 대상 수업 조회용)
    @Query("SELECT r FROM Reservation r " +
           "JOIN FETCH r.schedule s " +
           "JOIN FETCH s.program p " +
           "JOIN FETCH p.sportType st " +
           "JOIN FETCH s.userAdmin ua " +
           "JOIN FETCH r.branch " +
           "WHERE r.user.userId = :userId " +
           "AND r.sttsCd = :sttsCd " +
           "ORDER BY r.rsvDt DESC, r.rsvTime DESC")
    List<Reservation> findByUser_UserIdAndSttsCd(@Param("userId") String userId, @Param("sttsCd") RsvSttsCd sttsCd);
}