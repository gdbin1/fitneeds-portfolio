//package com.project.app.reservation.scheduler;
//
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Component;
//
//import com.project.app.reservation.service.ReservationHistoryService;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//
///**
// * 예약 완료 처리를 위한 스케줄러
// * 매일 새벽 1시에 날짜가 지난 예약을 이용내역으로 이동시킵니다.
// */
//@Slf4j
//@Component
//@RequiredArgsConstructor
//public class ReservationCompleteScheduler {
//
//    private final ReservationHistoryService reservationHistoryService;
//
//    /**
//     * 매일 새벽 1시에 실행되는 스케줄링 작업
//     * cron 표현식: 초 분 시 일 월 요일
//     * "0 0 1 * * ?" = 매일 01:00:00에 실행
//     */
//    @Scheduled(cron = "0 0 1 * * ?")
//    public void completePastReservations() {
//        log.info("[ReservationCompleteScheduler] 예약 완료 처리 스케줄러 시작");
//
//        try {
//            // 오늘 날짜 기준으로 지난 예약 처리
//            int processedCount = reservationHistoryService.completeReservations(null);
//
//            log.info("[ReservationCompleteScheduler] 예약 완료 처리 완료 - 처리 개수: {}", processedCount);
//
//        } catch (Exception e) {
//            log.error("[ReservationCompleteScheduler] 예약 완료 처리 중 오류 발생", e);
//        }
//
//        log.info("[ReservationCompleteScheduler] 예약 완료 처리 스케줄러 종료");
//    }
//}

package com.project.app.reservation.scheduler;

import java.time.LocalDate;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.project.app.reservation.service.ReservationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 예약 완료 처리를 위한 스케줄러
 * 매일 새벽 1시에 날짜가 지난 예약을 COMPLETED 상태로 변경하고
 * 이용권을 차감합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReservationCompleteScheduler {

    private final ReservationService reservationService;

    /**
     * 매일 새벽 1시에 실행
     * "0 0 1 * * ?" = 매일 01:00
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void completePastReservations() {
        log.info("[ReservationCompleteScheduler] 예약 완료 처리 스케줄러 시작");

        try {
            LocalDate baseDate = LocalDate.now();
            String batchUser = "SCHEDULER";

            int processedCount =
                reservationService.completeReservations(baseDate, batchUser);

            log.info(
                "[ReservationCompleteScheduler] 예약 완료 처리 완료 - 처리 개수: {}",
                processedCount
            );

        } catch (Exception e) {
            log.error(
                "[ReservationCompleteScheduler] 예약 완료 처리 중 오류 발생",
                e
            );
        }

        log.info("[ReservationCompleteScheduler] 예약 완료 처리 스케줄러 종료");
    }
}
