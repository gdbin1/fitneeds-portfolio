package com.project.app.pass_trade.dto.request;

import lombok.Data;

import java.math.BigDecimal;

// 거래 게시글 등록 요청 DTO
// 판매자가 이용권 판매 게시글 작성 시 전송하는 데이터
// saleAmount(총 판매 금액) 기준 사용, pricePerUnit 제거
@Data
public class PassTradePostCreateRequest {
    
    // 판매할 이용권 ID
    private Long userPassId;
    
    // 판매 수량
    private Integer sellCount;
    
    // 전체 판매 금액 (pricePerUnit 개념 제거)
    private BigDecimal saleAmount;
    
    // 게시글 제목
    private String title;
    
    // 게시글 내용
    private String content;

}