package com.project.app.pass_trade.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PassTradePostUpdateRequest {

    private String title;
    private String content;
    private Integer sellCount;
    private BigDecimal saleAmount;
}
