package com.project.app.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductCreateRequest(
        @NotNull(message = "스포츠 종목은 필수입니다.")
        Long sportId,

        @NotBlank(message = "상품명은 필수입니다.")
        String prodNm,

        @NotNull(message = "가격은 필수입니다.")
        @Min(value = 0, message = "가격은 0원 이상이어야 합니다.")
        BigDecimal prodAmt,

        @NotNull(message = "제공 횟수는 필수입니다.")
        @Min(value = 1, message = "제공 횟수는 1회 이상이어야 합니다.")
        Integer prvCnt
) {
}
