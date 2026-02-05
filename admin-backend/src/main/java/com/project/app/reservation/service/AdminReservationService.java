package com.project.app.reservation.service;

import com.project.app.global.dto.PagedResponse;
import com.project.app.reservation.dto.*;
import com.project.app.reservation.entity.Reservation;
import com.project.app.reservation.mapper.ReservationMapper;
import com.project.app.reservation.repository.ReservationRepository;
import com.project.app.schedule.entity.Schedule;
import com.project.app.schedule.repository.ScheduleRepository;
import com.project.app.ticket.entity.PassLog;
import com.project.app.ticket.entity.PassLogChgTypeCd;
import com.project.app.ticket.entity.UserPass;
import com.project.app.ticket.repository.PassLogRepository;
import com.project.app.ticket.repository.UserPassRepository;
import com.project.app.user.entity.User;
import com.project.app.user.repository.UserRepository;
import com.project.app.userAdmin.entity.UserAdmin;
import com.project.app.userAdmin.repository.UserAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminReservationService {

    private final ReservationRepository reservationRepository; // JPA (CUD용)
    private final ReservationMapper reservationMapper;         // MyBatis (조회용)

    // 연관된 엔티티 조회를 위한 레포지토리들
    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;
    private final UserPassRepository userPassRepository;
    private final PassLogRepository passLogRepository;
    private final UserAdminRepository userAdminRepository;

    // 1. 목록 조회 (MyBatis)
    public PagedResponse<ReservationResponse> getReservationList(ReservationSearchRequest request) {
        List<ReservationResponse> rows = reservationMapper.selectReservationList(request);
        int total = reservationMapper.countReservationList(request);
        return PagedResponse.of(rows, total, request.paging());
    }

    // 2. 상세 조회 (MyBatis)
    public ReservationResponse getReservationDetail(Long rsvId) {
        return reservationMapper.selectReservationDetail(rsvId);
    }

    // 3. 예약 수동 등록 (JPA)
    @Transactional
    public void createReservation(ReservationCreateRequest request, String adminId) {
        // 엔티티 조회 (검증)
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        Schedule schedule = scheduleRepository.findById(request.schdId())
                .orElseThrow(() -> new IllegalArgumentException("스케줄을 찾을 수 없습니다."));

        UserPass userPass = userPassRepository.findById(request.passId())
                .orElseThrow(() -> new IllegalArgumentException("이용권을 찾을 수 없습니다."));

        // 이용권 종목과 프로그램 종목 일치 여부 검증
        validateSportMatch(userPass, schedule);

        // 동일 시간대 중복 예약 체크
        validateDuplicateReservation(user.getUserId(), schedule);

        // 이용권 차감 로직 수행 (Entity Business Logic)
        userPass.deductCount(1);

        savePassLog(userPass, "USE", -1, "관리자 예약 등록 (" + adminId + ")", adminId);

        schedule.increaseReservationCount();

        // 예약 생성
        Reservation reservation = Reservation.create(user, schedule, userPass, adminId);
        reservationRepository.save(reservation);
    }

    // 4. 예약 정보 수정 (JPA - Dirty Checking)
    @Transactional
    public void updateReservation(Long rsvId, ReservationUpdateRequest request, String adminId) {
        Reservation reservation = findById(rsvId);

        Schedule newSchedule = scheduleRepository.findById(request.schdId())
                .orElseThrow(() -> new IllegalArgumentException("변경할 스케줄을 찾을 수 없습니다."));

        newSchedule.increaseReservationCount();

        reservation.getSchedule().decreaseReservationCount();
        // 엔티티 메서드를 통해 변경 (DB Update 쿼리 자동 발생)
        reservation.changeSchedule(newSchedule, adminId);
    }

    // 5. 예약 취소 (JPA - Dirty Checking)
    @Transactional
    public void cancelReservation(Long rsvId, ReservationCancelRequest request, String adminId) {
        Reservation reservation = findById(rsvId);
        if ("CANCELED".equals(reservation.getSttsCd())) {
            throw new IllegalStateException("이미 취소된 예약입니다.");
        }

        reservation.cancel(request.cnclRsn(), adminId);

        UserPass userPass = reservation.getPass();
        userPass.restore(1);

        savePassLog(userPass, "CANCEL", 1, "관리자 예약 취소: " + request.cnclRsn(), adminId);

        reservation.getSchedule().decreaseReservationCount();
    }

    // 6. 예약 상태 변경 (JPA - Dirty Checking)
    @Transactional
    public void updateReservationStatus(Long rsvId, ReservationStatusChangeRequest request, String adminId) {
        Reservation reservation = findById(rsvId);
        String newStatus = request.sttsCd();

        // 현재 상태가 CANCELED이면 상태 변경 불가
        if ("CANCELED".equals(reservation.getSttsCd())) {
            throw new IllegalStateException("취소된 예약은 상태를 변경할 수 없습니다.");
        }

        // 상태 변경 처리
        reservation.updateStatus(newStatus, adminId);
    }

    private Reservation findById(Long rsvId) {
        return reservationRepository.findById(rsvId)
                .orElseThrow(() -> new IllegalArgumentException("예약 정보를 찾을 수 없습니다."));
    }

    private void savePassLog(UserPass userPass, String type, int amount, String reason, String adminId) {
        // 1. String ID로 UserAdmin 엔티티 조회
        UserAdmin adminUser = userAdminRepository.findByUserId(adminId)
                .orElseThrow(() -> new IllegalArgumentException("관리자 정보를 찾을 수 없습니다: " + adminId));

        // 안전하게 enum으로 변환, 실패 시 PassLogChgTypeCd.OTHER로 기록
        PassLogChgTypeCd typeEnum;
        try {
            typeEnum = PassLogChgTypeCd.valueOf(type);
        } catch (Exception e) {
            typeEnum = PassLogChgTypeCd.OTHER;
        }

        // 2. 조회된 객체를 PassLog에 주입
        PassLog passLog = PassLog.builder()
                .userPass(userPass)
                .chgTypeCd(typeEnum)
                .chgCnt(amount)
                .chgRsn(reason)
                .processedBy(adminUser) // UserAdmin 객체
                .build();

        passLogRepository.save(passLog);
    }

    private void validateSportMatch(UserPass pass, Schedule schedule) {
        Long passSportId = pass.getSport().getSportId();
        Long programSportId = schedule.getProgram().getSportType().getSportId();

        if (!passSportId.equals(programSportId)) {
            throw new IllegalArgumentException("선택한 이용권의 종목(" + pass.getSport().getSportNm() +
                    ")과 수업 종목(" + schedule.getProgram().getSportType().getSportNm() + ")이 일치하지 않습니다.");
        }
    }

    private void validateDuplicateReservation(String userId, Schedule schedule) {
        LocalDate startDate = schedule.getStrtDt();
        LocalTime startTime = schedule.getStrtTm();
        int duplicateCount = reservationMapper.countDuplicateReservation(userId, startDate, startTime, "RESERVED");
        if (duplicateCount > 0) {
            throw new IllegalStateException("해당 시간에 이미 예약된 내역이 있습니다.");
        }
    }
}
