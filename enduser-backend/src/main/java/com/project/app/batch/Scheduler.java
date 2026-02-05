//package com.project.app.batch;
//
//import java.time.LocalDateTime;
//
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Component;
//
//import com.project.app.reservation.service.ReservationService;
//import com.project.app.schedule.service.ScheduleService;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//
//@Component
//@RequiredArgsConstructor
//@Slf4j
//public class Scheduler {
//
//    private final ReservationService reservationService;
//    private final ScheduleService scheduleService;
//
//    // 매일 새벽 1시에 실행 (UTC 기준으로 설정되므로, 서버 시간대 고려)
//    // cron 표현식: "초 분 시 일 월 요일"
//    // "0 0 1 * * *" = 매일 새벽 1시 0분 0초
//    // fixedDelayString = "3600000" (1시간마다): 특정 간격마다 실행
//    // initialDelayString = "60000" (앱 시작 후 1분 뒤 첫 실행)
//
//    @Scheduled(cron = "0 0 1 * * *") // 매일 새벽 1시에 실행
//    public void updateExpiredData() {
//        String batchUser = "SCHEDULER_BATCH"; // 스케줄러가 업데이트했음을 기록할 사용자 ID
//
//        log.info("[Scheduler] Batch job started at {}", LocalDateTime.now());
//
//        // 1. RESERVATION 테이블 업데이트
//        try {
//            int updatedReservations = reservationService.updatePastReservationsToCompleted(batchUser);
//            log.info("[Scheduler] {} past reservations updated to COMPLETED.", updatedReservations);
//        } catch (Exception e) {
//            log.error("[Scheduler] Error updating past reservations: {}", e.getMessage(), e);
//        }
//
//        // 2. SCHEDULE 테이블 업데이트
//        try {
//            int updatedSchedules = scheduleService.updatePastSchedulesToClosed(batchUser);
//            log.info("[Scheduler] {} past schedules updated to CLOSED.", updatedSchedules);
//        } catch (Exception e) {
//            log.error("[Scheduler] Error updating past schedules: {}", e.getMessage(), e);
//        }
//
//        log.info("[Scheduler] Batch job finished at {}", LocalDateTime.now());
//    }
//}

package com.project.app.batch;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.project.app.reservation.service.ReservationService;
import com.project.app.schedule.service.ScheduleService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class Scheduler {

    private final ReservationService reservationService;
    private final ScheduleService scheduleService;

    @Scheduled(cron = "0 0 1 * * *") // 매일 새벽 1시
    public void updateExpiredData() {
        String batchUser = "SCHEDULER_BATCH";
        LocalDate baseDate = LocalDate.now(); // 오늘 기준 이전 예약 처리

        log.info("[Scheduler] Batch job started at {}", LocalDateTime.now());

        // 1. 예약 완료 처리 + 이용권 차감 + 로그 생성
        try {
            int completedCount =
                reservationService.completeReservations(baseDate, batchUser);

            log.info("[Scheduler] {} reservations completed.", completedCount);
        } catch (Exception e) {
            log.error("[Scheduler] Error completing reservations", e);
        }

        // 2. 스케줄 상태 CLOSED 처리 (기존 유지)
        try {
            int updatedSchedules =
                scheduleService.updatePastSchedulesToClosed(batchUser);

            log.info("[Scheduler] {} schedules closed.", updatedSchedules);
        } catch (Exception e) {
            log.error("[Scheduler] Error updating schedules", e);
        }

        log.info("[Scheduler] Batch job finished at {}", LocalDateTime.now());
    }
}
