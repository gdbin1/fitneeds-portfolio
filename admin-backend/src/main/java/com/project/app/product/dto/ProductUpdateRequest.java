package com.project.app.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductUpdateRequest(
        @NotBlank(message = "상품명은 필수입니다.")
        String prodNm,

        @NotNull(message = "가격은 필수입니다.")
        @Min(0)
        BigDecimal prodAmt,

        @NotNull(message = "제공 횟수는 필수입니다.")
        @Min(1)
        Integer prvCnt
) {
}