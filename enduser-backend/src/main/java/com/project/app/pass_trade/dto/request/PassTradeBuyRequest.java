package com.project.app.pass_trade.dto.request;

import lombok.Data;

// 즉시 구매 요청 DTO
// 구매자가 구매할 수량을 지정하여 전송
@Data
public class PassTradeBuyRequest {
    
    // 구매할 수량
    private Integer buyQty;

}