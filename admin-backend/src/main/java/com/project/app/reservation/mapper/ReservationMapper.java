package com.project.app.reservation.mapper;

import com.project.app.reservation.dto.ReservationResponse;
import com.project.app.reservation.dto.ReservationSearchRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Mapper
public interface ReservationMapper {

    /**
     * 예약 목록 조회 (조인 포함)
     */
    List<ReservationResponse> selectReservationList(ReservationSearchRequest request);

    /**
     * 예약 목록 총 개수
     */
    int countReservationList(ReservationSearchRequest request);

    /**
     * 예약 상세 조회
     */
    ReservationResponse selectReservationDetail(Long rsvId);

    /**
     * 중복 예약 개수 조회
     */
    int countDuplicateReservation(@Param("userId") String userId,
                                  @Param("startDate") LocalDate startDate,
                                  @Param("startTime") LocalTime startTime,
                                  @Param("status") String status);
}
