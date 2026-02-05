package com.project.app.reservation.dto;

import com.project.app.global.dto.BasePagingRequest;

import java.time.LocalDate;

public record ReservationSearchRequest(
        Long branchId,
        String memberName,
        String sttsCd,
        LocalDate startDate,
        BasePagingRequest paging
) {
}
