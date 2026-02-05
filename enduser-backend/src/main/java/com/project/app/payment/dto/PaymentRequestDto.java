package com.project.app.payment.dto;

import com.project.app.payment.entity.PaymentPayMethod;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDto {

    @NotNull(message = "사용자 ID는 필수입니다.")
    private String userId;	// 결제를 진행하는 사용자 ID (UUID 또는 Long)

    @NotNull(message = "결제 금액은 필수입니다.")
    @Min(value = 1, message = "결제 금액은 1원 이상이어야 합니다.")
    private BigDecimal amount; // 결제 금액

    @NotNull(message = "결제 수단은 필수입니다.")
    private PaymentPayMethod payMethod; // 결제 수단 (예: PASS, CARD, REMITTANCE, POINT)

    // SCHEDULE_RESERVATION 결제에 필요한 상세 정보
    @NotNull(message = "스케줄 ID는 필수입니다.")
    private Long schdId; // 예약하려는 스케줄 ID

    @NotNull(message = "예약 날짜는 필수입니다.")
    private String reservationDate; // YYYY-MM-DD 형식의 예약 날짜 문자열

    @NotNull(message = "예약 시간은 필수입니다.")
    @Pattern(regexp = "^([01]\\d|2[0-3]):([0-5]\\d)$", message = "예약 시간은 HH:MM 형식이어야 합니다.")
    private String reservationTime;

    // 이용권(PASS) 결제 시 필요한 정보
    private Long userPassId; // 결제 수단이 PASS인 경우, 사용할 이용권의 ID

    // 기타 결제 정보 (선택 사항)
    private String paymentDetails; // PG사 등 실제 결제에 필요한 상세 정보
    
    @NotNull(message = "결제 대상 ID는 필수입니다.")
    private Long targetId;
    
    @NotNull(message = "결제 대상 이름은 필수입니다.")
    private String targetName;
}
