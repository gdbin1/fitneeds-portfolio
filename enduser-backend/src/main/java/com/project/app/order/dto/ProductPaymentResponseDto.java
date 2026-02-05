package com.project.app.order.dto;

import com.project.app.payment.entity.PaymentSttsCd;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Order 패키지에서 사용하는 결제 응답 DTO
 */
public class ProductPaymentResponseDto {
    private Long payId;
    private String ordNo;
    private PaymentSttsCd sttsCd;
    private BigDecimal payAmt;
    private LocalDateTime regDt;

    public ProductPaymentResponseDto() {}

    public ProductPaymentResponseDto(Long payId, String ordNo, PaymentSttsCd sttsCd, BigDecimal payAmt, LocalDateTime regDt) {
        this.payId = payId;
        this.ordNo = ordNo;
        this.sttsCd = sttsCd;
        this.payAmt = payAmt;
        this.regDt = regDt;
    }

    public Long getPayId() { return payId; }
    public String getOrdNo() { return ordNo; }
    public PaymentSttsCd getSttsCd() { return sttsCd; }
    public BigDecimal getPayAmt() { return payAmt; }
    public LocalDateTime getRegDt() { return regDt; }
}
