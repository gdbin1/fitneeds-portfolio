package com.project.app.market.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PassTradeTransactionDto(
        Long tradeId,
        Long postId,
        String buyerUserId,
        BigDecimal tradeAmt,
        String sttsCd,
        LocalDateTime regDt,
        Integer buyQty,
        Long paymentId
) {
}

