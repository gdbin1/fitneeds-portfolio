package com.project.app.ticket.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record UserPassCreateRequest(
        @NotNull String userId,         // 누구에게
        @NotNull Long sportId,          // 어떤 스포츠 종목을
        @PositiveOrZero Integer rmnCnt, // 몇 회
        String status,                  // 상태 (ACTIVE 등)
        Long prodId                     // 상품 ID (옵션)
) {
}

