package com.project.app.global.dto;

import java.util.List;

public record PagedResponse<T>(
        List<T> content,
        long totalElements,
        int totalPages,
        int currentPage,
        int size
) {
    public static <T> PagedResponse<T> of(List<T> content, long total, BasePagingRequest req) {
        int totalPages = (int) Math.ceil((double) total / req.size());
        return new PagedResponse<>(content, total, totalPages, req.page(), req.size());
    }
}