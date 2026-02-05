package com.project.app.pass_trade.dto.request;

import lombok.Data;

/**
 * 이용권 거래 완료 요청 DTO
 */
@Data
public class PassTradeCompleteRequest {

    private Long postId;     // 거래 게시글 ID
    private String buyerId;  // 구매자 ID
    private Integer buyCount; // 구매 수량
}