package com.project.app.reservation.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.app.branch.entity.Branch;
import com.project.app.reservation.dto.MyReservationResponseDto;
import com.project.app.reservation.dto.PastHistoryResponseDto;
import com.project.app.reservation.entity.AttendanceStatus;
import com.project.app.reservation.entity.Reservation;
import com.project.app.reservation.entity.RsvSttsCd;
import com.project.app.reservation.repository.ReservationRepository;
import com.project.app.schedule.entity.Schedule;
import com.project.app.user.entity.User;
import com.project.app.userpass.entity.PassLogChgTypeCd;
import com.project.app.userpass.entity.UserPass;
import com.project.app.userpass.service.PassLogService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final PassLogService passLogService;

    /**
     * 예약 생성
     */
    public Reservation createReservation(
            User user,
            Schedule schedule,
            Branch branch,
            UserPass userPass,
            LocalDate rsvDt,
            LocalTime rsvTime
    ) {
        Reservation reservation = Reservation.builder()
                .user(user)
                .schedule(schedule)
                .branch(branch)
                .userPass(userPass)
                .rsvDt(rsvDt)
                .rsvTime(rsvTime)
                .sttsCd(RsvSttsCd.CONFIRMED)
                .attendanceStatus(AttendanceStatus.UNCHECKED)
                .reviewWritten(true)
//                .updId(user.getUserId())
                .build();

        return reservationRepository.save(reservation);
    }

    /**
     * 예약 취소 - 기존 PassLog 로직과 충돌 방지
     */
    public void cancelReservation(Long rsvId, String userId, String cancelReason) {
        
        Reservation reservation = reservationRepository.findById(rsvId)
                .orElseThrow(() -> new NoSuchElementException("예약을 찾을 수 없습니다. rsvId=" + rsvId));

        if (!reservation.getUser().getUserId().equals(userId)) {
            throw new IllegalArgumentException("본인의 예약만 취소할 수 있습니다.");
        }

        // 단순히 상태만 변경 (PassLog 로직은 다른 곳에서 처리)
        reservation.cancel(cancelReason, userId);
        reservationRepository.save(reservation);
    }

    /**
     * 내 예약 목록 조회(CONFIRMED)
     */
    @Transactional(readOnly = true)
    public List<MyReservationResponseDto> getMyReservations(String userId) {

        List<Reservation> reservations =
                reservationRepository.findByUserIdWithDetails(userId);

        return reservations.stream()
                .map(MyReservationResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 수업 완료 처리 (배치) - 이용권 차감 + COMPLETED 상태 변경
     */
    public int completeReservations(LocalDate baseDate, String batchUser) {

        // 기준 날짜 이전의 CONFIRMED 예약들을 찾아서 완료 처리
        List<Reservation> targets =
                reservationRepository.findByRsvDtBeforeAndSttsCd(baseDate, RsvSttsCd.CONFIRMED);

        for (Reservation r : targets) {
            // 이용권 차감 (이용 완료 시점)
            if (r.getUserPass() != null) {
                UserPass userPass = r.getUserPass();
                
                boolean success = userPass.decreaseRmnCnt();
                if (!success) {
                    log.warn("이용권 잔여 횟수 부족 - reservationId: {}", r.getRsvId());
                    continue;
                }

                // 이용내역 로그 생성
                passLogService.createPassLog(
                        userPass,
                        PassLogChgTypeCd.USE,
                        -1,
                        "수업 완료",
                        null
                );
            }

            // CONFIRMED → COMPLETED 상태 변경 (삭제 대신)
            r.complete();
            r.setUpdId(batchUser);
            reservationRepository.save(r);
        }
        return targets.size();
    }
    
    /**
     * 완료된 예약 목록 조회 (이용내역 - COMPLETED)
     */
    @Transactional(readOnly = true)
    public List<PastHistoryResponseDto> getCompletedReservations(String userId) {
        List<Reservation> reservations = 
                reservationRepository.findByUser_UserIdAndSttsCd(userId, RsvSttsCd.COMPLETED);
        
        return reservations.stream()
                .map(PastHistoryResponseDto::from)
                .collect(Collectors.toList());
    }
}

