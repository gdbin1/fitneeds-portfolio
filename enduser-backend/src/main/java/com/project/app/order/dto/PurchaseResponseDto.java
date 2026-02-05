package com.project.app.order.dto;

import com.project.app.payment.entity.PaymentSttsCd;

import java.math.BigDecimal;

public record PurchaseResponseDto(
        Long payId,
        String ordNo,
        PaymentSttsCd sttsCd,
        BigDecimal payAmt,
        Long userPassId
) {
}

