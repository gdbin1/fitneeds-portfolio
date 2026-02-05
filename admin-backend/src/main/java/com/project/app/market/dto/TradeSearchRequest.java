package com.project.app.market.dto;

import com.project.app.global.dto.BasePagingRequest;

public record TradeSearchRequest(
        String buyerId,
        String sellerId,
        String status,
        BasePagingRequest paging
) {
}
