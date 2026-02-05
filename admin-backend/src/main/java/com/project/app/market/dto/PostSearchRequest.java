package com.project.app.market.dto;

import com.project.app.global.dto.BasePagingRequest;

public record PostSearchRequest(
        String sellerId,
        String status,
        String keyword,
        BasePagingRequest paging
) {
}
