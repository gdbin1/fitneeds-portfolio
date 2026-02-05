package com.project.app.payment.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

import com.project.app.payment.dto.MyPaymentResponseDto;
import com.project.app.payment.entity.Payment;
import com.project.app.payment.entity.PaymentSttsCd;
import com.project.app.payment.repository.MyPaymentRepository;
import com.project.app.reservation.entity.Reservation;
import com.project.app.reservation.repository.ReservationRepository;
import com.project.app.reservation.service.ReservationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MyPaymentService {

    private final MyPaymentRepository myPaymentRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationService reservationService;

    /**
     * 사용자의 결제 목록을 조회합니다.
     * Payment와 Reservation을 연결하여 프로그램 정보를 포함합니다.
     *
     * @param userId 사용자 ID
     * @return 결제 목록 DTO 리스트
     */
    
    //20260112 수정요함.
    
    @Transactional(readOnly = true)
    public List<MyPaymentResponseDto> getMyPayments(String userId) {
        log.info("[MyPaymentService] 사용자 결제 목록 조회 시작 - userId: {}", userId);

        // 사용자의 결제 목록 조회
        List<Payment> payments = myPaymentRepository.findByUserIdWithDetails(userId);

        log.info("[MyPaymentService] 조회된 결제 개수: {}", payments.size());

        // Payment를 DTO로 변환 (Reservation 정보 포함)
        List<MyPaymentResponseDto> result = payments.stream()
                .map(payment -> {
                    String programName = "프로그램";
                    String option = "그룹 레슨";

                    // Payment의 refId로 Reservation 찾기
                    if (payment.getTargetId() != null) {
                        Reservation reservation = reservationRepository.findById(payment.getTargetId())
                                .orElse(null);

                        if (reservation != null && reservation.getSchedule() != null) {
                            if (reservation.getSchedule().getProgram() != null) {
                                programName = reservation.getSchedule().getProgram().getProgNm();
                            }
                            // 옵션은 스케줄 타입이나 프로그램 정보에서 가져올 수 있음
                            // 현재는 기본값 "그룹 레슨" 사용
                            option = "그룹 레슨";
                        }
                    }

                    return MyPaymentResponseDto.from(payment, programName, option);
                })
                .collect(Collectors.toList());

        log.info("[MyPaymentService] 결제 목록 조회 완료 - 변환된 개수: {}", result.size());

        return result;
    }

    /**
     * 결제를 취소합니다.
     * 결제 취소 시 연결된 예약도 함께 취소됩니다.
     *
     * @param paymentId 취소할 결제 ID
     * @param userId 취소 요청한 사용자 ID (권한 확인용)
     * @param cancelReason 취소 사유 (선택사항)
     * @return 취소 성공 여부와 메시지
     */
    @Transactional
    public boolean cancelPayment(Long paymentId, String userId, String cancelReason) {
        log.info("[MyPaymentService] 결제 취소 시작 - paymentId: {}, userId: {}", paymentId, userId);

        Payment payment = myPaymentRepository.findById(paymentId)
                .orElseThrow(() -> new NoSuchElementException("결제를 찾을 수 없습니다: " + paymentId));

        // 권한 확인: 결제한 사용자만 취소 가능
        if (!payment.getUser().getUserId().equals(userId)) {
            log.warn("[MyPaymentService] 권한 없음 - paymentId: {}, userId: {}", paymentId, userId);
            throw new IllegalStateException("본인의 결제만 취소할 수 있습니다.");
        }

        // 이미 취소된 결제인지 확인
        if (payment.getSttsCd() == PaymentSttsCd.CANCELED) {
            log.warn("[MyPaymentService] 이미 취소된 결제 - paymentId: {}", paymentId);
            throw new IllegalStateException("이미 취소된 결제입니다.");
        }

        // 결제 상태를 CANCELED로 변경
        payment.setSttsCd(PaymentSttsCd.CANCELED);
        myPaymentRepository.save(payment);

        // 연결된 예약이 있으면 예약도 취소
        if (payment.getTargetId() != null) {
            try {
                log.info("[MyPaymentService] 연결된 예약 취소 시작 - reservationId: {}", payment.getTargetId());
                reservationService.cancelReservation(
                        payment.getTargetId(),
                        userId,
                        cancelReason != null ? cancelReason : "결제 취소"
                );
                log.info("[MyPaymentService] 연결된 예약 취소 완료 - reservationId: {}", payment.getTargetId());
            } catch (Exception e) {
                // 예약 취소 실패해도 결제 취소는 완료된 상태이므로 로그만 남기고 계속 진행
                log.error("[MyPaymentService] 결제 취소 시 예약 취소 실패 - reservationId: {}", payment.getTargetId(), e);
            }
        }

        log.info("[MyPaymentService] 결제 취소 완료 - paymentId: {}", paymentId);
        return true;
    }
}