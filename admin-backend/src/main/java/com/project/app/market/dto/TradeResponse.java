package com.project.app.market.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TradeResponse(
        Long tradeId,
        Long postId,
        String postTitle,
        String sportName,
        String sellerId,
        String buyerId,
        BigDecimal tradeAmt,
        Integer buyQty,
        String sttsCd,
        LocalDateTime regDt
) {
}

