package com.project.app.market.dto;

import java.math.BigDecimal;

public record PostUpdateRequest(
        String title,
        String content,
        BigDecimal saleAmt
) {
}

