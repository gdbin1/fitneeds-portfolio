package com.project.app.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.project.app.payment.entity.Payment;
import com.project.app.payment.entity.PaymentSttsCd;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyPaymentResponseDto {

    private Long paymentId;
    private Long id;  // 프론트엔드 호환성을 위한 별칭
    private LocalDateTime paymentDate;
    private String date;  // 프론트엔드 호환성을 위한 문자열 형식
    private String programName;
    private String productName;  // 프론트엔드 호환성
    private String option;
    private BigDecimal paymentAmount;
    private BigDecimal price;  // 프론트엔드 호환성
    private String paymentStatus;
    private String cancelRefundStatus;

    public static MyPaymentResponseDto from(Payment payment, String programName, String option) {
        // PaymentSttsCd를 프론트엔드가 기대하는 형식으로 변환
        String statusStr = convertPaymentStatus(payment.getSttsCd());

        // paymentDate를 문자열 형식으로 변환
        String dateStr = payment.getRegDt() != null
                ? payment.getRegDt().toLocalDate().toString()
                : null;

        return MyPaymentResponseDto.builder()
                .paymentId(payment.getPayId())
                .id(payment.getPayId())  // 프론트엔드 호환성
                .paymentDate(payment.getRegDt())
                .date(dateStr)
                .programName(programName != null ? programName : "프로그램")
                .productName(programName != null ? programName : "프로그램")
                .option(option != null ? option : "그룹 레슨")
                .paymentAmount(payment.getPayAmt())
                .price(payment.getPayAmt())  // 프론트엔드 호환성
                .paymentStatus(statusStr)
                .cancelRefundStatus(payment.getSttsCd() == PaymentSttsCd.CANCELED ? "취소완료" : null)
                .build();
    }

    /**
     * PaymentSttsCd를 프론트엔드가 기대하는 문자열 형식으로 변환
     */
    private static String convertPaymentStatus(PaymentSttsCd status) {
        if (status == null) {
            return "PENDING";
        }

        switch (status) {
            case PAID:
                return "COMPLETED";
            case PENDING:
                return "PENDING";
            case CANCELED:
                return "CANCELED";
            case FAILED:
                return "FAILED";
            default:
                return "PENDING";
        }
    }
}