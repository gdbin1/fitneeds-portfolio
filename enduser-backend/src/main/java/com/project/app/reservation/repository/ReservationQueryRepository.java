package com.project.app.reservation.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.project.app.reservation.dto.PastHistoryResponseDto;

@Repository
public interface ReservationQueryRepository {

    @Query("""
    SELECT new com.project.app.reservation.dto.PastHistoryResponseDto(
        r.rsvId,
        s.schdId,
        s.sportName,
        b.brchNm,
        s.trainerName,
        r.rsvDt,
        r.rsvTime,
        pl.passLogId,
        r.reviewWritten
    )
    FROM Reservation r
    JOIN r.schedule s
    JOIN r.branch b
    JOIN PassLog pl ON pl.reservation = r
    WHERE r.user.userId = :userId
      AND r.sttsCd = 'COMPLETED'
      AND pl.chgTypeCd = 'USE'
      AND (:startDate IS NULL OR r.rsvDt >= :startDate)
      AND (:endDate IS NULL OR r.rsvDt <= :endDate)
      AND (:branchId IS NULL OR b.brchId = :branchId)
    ORDER BY r.rsvDt DESC, r.rsvTime DESC
    """)
    List<PastHistoryResponseDto> findPastHistory(
        String userId,
        LocalDate startDate,
        LocalDate endDate,
        Long branchId
    );
}

