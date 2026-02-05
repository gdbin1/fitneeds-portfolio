package com.project.app.payment.dto;

import com.project.app.payment.entity.Payment;
import com.project.app.payment.entity.PaymentPayMethod;
import com.project.app.payment.entity.PaymentPayTypeCd;
import com.project.app.payment.entity.PaymentSttsCd;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PaymentResponseDto {

    private Long payId;
    private String ordNo;
    private String userId;
    private PaymentPayTypeCd payTypeCd;
//    private Long refId;
    private BigDecimal payAmt;
    private PaymentPayMethod payMethod;
    private PaymentSttsCd sttsCd;

    public static PaymentResponseDto from(Payment payment) {
        return PaymentResponseDto.builder()
                .payId(payment.getPayId())
                .ordNo(payment.getOrdNo())
                .userId(payment.getUser().getUserId())
                .payTypeCd(payment.getPayTypeCd())
//                .refId(payment.getRefId())
                .payAmt(payment.getPayAmt())
                .payMethod(payment.getPayMethod())
                .sttsCd(payment.getSttsCd())
                .build();
    }
}