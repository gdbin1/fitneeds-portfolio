package com.project.app.review.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.app.review.dto.HistoryReviewResponseDto;
import com.project.app.review.dto.ReviewDto;
import com.project.app.review.mapper.ReviewMapper;
import com.project.app.reservation.entity.Reservation;
import com.project.app.reservation.entity.RsvSttsCd;
import com.project.app.reservation.repository.ReservationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 이용내역 리뷰 관련 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewHistoryService {

    private final ReviewMapper reviewMapper;
    private final ReservationRepository reservationRepository;
    // PassLogRepository는 현재 사용하지 않으므로 제거

    /**
     * 사용자의 리뷰 작성 가능한 수업 목록을 조회합니다.
     * PassLog(USE 타입) + Reservation(COMPLETED 상태) 조인으로 조회
     *
     * @param userId 사용자 ID
     * @return 리뷰 작성 가능한 수업 목록
     */
    public List<HistoryReviewResponseDto> getReviewableClasses(String userId) {
        log.info("[ReviewHistoryService] 리뷰 작성 가능한 수업 목록 조회 시작 - userId: {}", userId);

        // COMPLETED 상태의 예약들을 조회 (이용 완료된 수업)
        List<Reservation> completedReservations = 
            reservationRepository.findByUser_UserIdAndSttsCd(userId, RsvSttsCd.COMPLETED);

        // DTO 변환
        List<HistoryReviewResponseDto> result = completedReservations.stream()
                .map(reservation -> {
                    return HistoryReviewResponseDto.builder()
                            .reservationId(reservation.getRsvId())
                            .instructorId(reservation.getSchedule().getUserAdmin().getUserId()) // String 그대로 사용
                            .registrationDateTime(reservation.getRsvDt().toString() + " " + reservation.getRsvTime().toString())
                            .build();
                })
                .collect(Collectors.toList());

        log.info("[ReviewHistoryService] 리뷰 작성 가능한 수업 목록 조회 완료 - 개수: {}", result.size());
        return result;
    }

    /**
     * 이용내역 ID로 리뷰를 조회합니다. (기존 메서드 유지)
     */
    public List<HistoryReviewResponseDto> getReviewByHistoryId(Long historyId, String userId) {
        // 기존 로직 유지...
        return null; // TODO: 필요시 구현
    }
}