package com.project.app.global.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record BasePagingRequest(
        @Schema(description = "페이지 번호 (1부터 시작)", defaultValue = "1")
        Integer page,

        @Schema(description = "페이지당 건수", defaultValue = "10")
        Integer size,

        @Schema(description = "정렬 필드")
        String sortField,

        @Schema(description = "정렬 방향 (ASC/DESC)", defaultValue = "DESC")
        String sortOrder
) {
    public BasePagingRequest {
        if (page == null || page < 1) page = 1;
        if (size == null || size < 1) size = 10;
        if (sortOrder == null) sortOrder = "DESC";
    }

    // MyBatis에서 사용할 offset 계산
    public int offset() {
        return (page - 1) * size;
    }
}