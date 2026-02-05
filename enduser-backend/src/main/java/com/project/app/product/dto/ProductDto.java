package com.project.app.product.dto;

import java.math.BigDecimal;

import com.project.app.product.entity.PassProduct;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductDto {
    private Long prodId;
    private String sportNm;
    private String prodNm;
    private BigDecimal prodAmt;
    private Integer prvCnt;

    public static ProductDto of(PassProduct p, String sportName) {
        return ProductDto.builder()
                .prodId(p.getProdId())
                .sportNm(sportName)
                .prodNm(p.getProdNm())
                .prodAmt(p.getProdAmt())
                .prvCnt(p.getPrvCnt())
                .build();
    }
}
