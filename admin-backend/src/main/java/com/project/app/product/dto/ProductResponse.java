package com.project.app.product.dto;

import com.project.app.product.entity.PassProduct;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(
        Long prodId,
        Long sportId,
        String sportName,
        String prodNm,
        BigDecimal prodAmt,
        Integer prvCnt,
        Boolean useYn,
        LocalDateTime regDt,
        LocalDateTime updDt
) {
    public static ProductResponse from(PassProduct product) {
        return new ProductResponse(
                product.getProdId(),
                product.getSport().getSportId(),
                product.getSport().getSportNm(),
                product.getProdNm(),
                product.getProdAmt(),
                product.getPrvCnt(),
                product.getUseYn(),
                product.getRegDt(),
                product.getUpdDt()
        );
    }
}
