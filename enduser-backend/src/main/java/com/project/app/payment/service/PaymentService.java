package com.project.app.payment.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.app.branch.entity.Branch;
import com.project.app.payment.dto.PaymentRequestDto;
import com.project.app.payment.entity.Payment;
import com.project.app.payment.entity.PaymentPayMethod;
import com.project.app.payment.entity.PaymentPayTypeCd;
import com.project.app.payment.entity.PaymentSttsCd;
import com.project.app.payment.repository.PaymentRepository;
import com.project.app.reservation.entity.RsvSttsCd;
import com.project.app.reservation.repository.ReservationRepository;
import com.project.app.reservation.service.ReservationService;
import com.project.app.schedule.entity.Schedule;
import com.project.app.schedule.repository.ScheduleRepository;
import com.project.app.user.entity.User;
import com.project.app.user.repository.UserRepository;
import com.project.app.userpass.entity.UserPass;
import com.project.app.userpass.service.UserPassService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

	private final PaymentRepository paymentRepository;
	private final UserRepository userRepository;
	private final UserPassService userPassService;
	private final ScheduleRepository scheduleRepository;
	private final ReservationService reservationService;
	private final ReservationRepository reservationRepository;

    /**
     * ===============================
     * 이용권 거래 결제 생성 (PASS_TRADE)
     * ===============================
     * - pass_trade 전용
     * - 예약 / 이용권 구매 로직과 분리
     * - 결제 생성 책임만 가짐
     */
    @Transactional
    public Payment createPassTradePayment(
            String buyerId,
            BigDecimal amount,
            Long refTransactionId
    ) {
        User buyer = userRepository.findByUserId(buyerId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Payment payment = Payment.builder()
                .user(buyer)
                .payTypeCd(PaymentPayTypeCd.PASS_TRADE)   //  거래 결제
                .targetId(refTransactionId)                  // 거래 ID 참조
                .payAmt(amount)
                .payMethod(PaymentPayMethod.CARD)        // 현재는 카드 고정
                .sttsCd(PaymentSttsCd.PAID)               // 즉시 결제 완료
                .regDt(LocalDateTime.now())
                .build();

        return paymentRepository.save(payment);
    }

    /**
     * 결제를 생성하고 처리하며, 결제 성공 시 예약을 생성합니다.
     *
     * @param requestDto 결제 요청 DTO
     * @return 생성된 Payment 엔티티 (결제 응답으로 사용)
     */
    @Transactional
    public Payment createAndProcessPayment(PaymentRequestDto requestDto) {
        // 1. 기초 데이터 조회
        User user = userRepository.findByUserId(requestDto.getUserId())
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다: " + requestDto.getUserId()));

        Schedule schedule = scheduleRepository.findById(requestDto.getSchdId())
                .orElseThrow(() -> new NoSuchElementException("스케줄을 찾을 수 없습니다: " + requestDto.getSchdId()));

        LocalDate rsvDate = LocalDate.parse(requestDto.getReservationDate());
        LocalTime rsvTime = LocalTime.parse(requestDto.getReservationTime());

        // A. 동일 스케줄 중복 예약 체크 (현재 상태가 'CONFIRMED'인 것 기준)
        boolean isAlreadyReserved = reservationRepository.existsByUser_UserIdAndSchedule_SchdIdAndSttsCd(
                user.getUserId(), schedule.getSchdId(), RsvSttsCd.CONFIRMED);
        if (isAlreadyReserved) {
            throw new IllegalStateException("이미 예약된 스케줄입니다.");
        }

        // B. 동일 시간대 중복 예약 체크
        boolean isTimeOverlapping = reservationRepository.existsByUser_UserIdAndRsvDtAndRsvTimeAndSttsCd(
                user.getUserId(), rsvDate, rsvTime, RsvSttsCd.CONFIRMED);
        if (isTimeOverlapping) {
            throw new IllegalStateException("해당 시간에 이미 다른 예약이 있습니다.");
        }

        Branch branch = null;
        try {
            // schedule.getUserAdmin()이 null인지, 혹은 그 결과의 .getBranch()가 null인지 확인
            if (schedule.getUserAdmin() != null && schedule.getUserAdmin().getBranch() != null) {
                branch = schedule.getUserAdmin().getBranch();
            } else {
                throw new NoSuchElementException("스케줄에 연결된 강사 또는 지점 정보가 유효하지 않습니다. 스케줄 ID: " + requestDto.getSchdId());
            }
        } catch (Exception e) { // 혹시 모를 다른 예외도 함께 catch
            throw new RuntimeException("스케줄에서 지점 정보를 가져오는 중 오류 발생. 스케줄 ID: " + requestDto.getSchdId() + ", 오류: " + e.getMessage(), e);
        }


        UserPass usedUserPass = null;
        // 1. PayMethod에 따른 이용권 사용 처리 (기존 로직 유지)
        if (requestDto.getPayMethod() == PaymentPayMethod.PASS) {
            if (requestDto.getUserPassId() == null) {
                throw new IllegalArgumentException("이용권 결제 시 userPassId는 필수입니다.");
            }
            usedUserPass = userPassService.usePassForR(requestDto.getUserPassId(), "스케줄 예약(" + schedule.getSchdId() + ")");
            if (!usedUserPass.getSportType().getSportId().equals(schedule.getProgram().getSportType().getSportId())) {
            	throw new IllegalArgumentException("다른 종목의 이용권은 사용 할 수 없습니다.");
            }
            if (requestDto.getAmount().compareTo(BigDecimal.ZERO) != 0) {
                throw new IllegalArgumentException("이용권 결제 시 금액은 0원이어야 합니다.");
            }
        } else {
            if (requestDto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("이용권 결제가 아닌 경우 결제 금액은 0보다 커야 합니다.");
            }
        }
        

        // 2. Payment 엔티티 생성 및 저장 (기존 로직 유지)
        Payment payment = Payment.builder()
                .user(user)
                .payTypeCd(PaymentPayTypeCd.SCHEDULE_RESERVATION)
//                .refId(schedule.getSchdId())
                .payMethod(requestDto.getPayMethod())
                .targetId(schedule.getSchdId())
                .targetName(schedule.getProgram().getProgNm())
                .payAmt(requestDto.getAmount())
                .sttsCd(PaymentSttsCd.PAID)
                .regDt(LocalDateTime.now())
                .build();
        Payment savedPayment = paymentRepository.save(payment);

        // 3. 결제 완료 후 Reservation 엔티티 생성 및 저장 (Huch의 Reservation 엔티티에 맞춤)
        reservationService.createReservation(
                user,
                schedule,
                branch,         // 이제 null이 아님을 보장합니다.
                usedUserPass,   // null이 될 수 있음
                LocalDate.parse(requestDto.getReservationDate()),
                LocalTime.parse(requestDto.getReservationTime())
        );

        return savedPayment;
    }
}