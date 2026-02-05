package com.project.app.product.dto;

import com.project.app.global.dto.BasePagingRequest;

public record ProductSearchRequest(
        Long sportId,
        Boolean useYn,
        String keyword,
        BasePagingRequest paging
) {
}
