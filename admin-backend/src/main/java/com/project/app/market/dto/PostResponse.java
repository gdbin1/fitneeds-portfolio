package com.project.app.market.dto;

import com.project.app.market.entity.PassTradePost;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PostResponse(
        Long postId,
        String sellerId,
        String sportName,
        String ticketName,
        String title,
        String content,
        Integer sellQty,
        BigDecimal saleAmt,
        String statusCode,
        Boolean delYn,
        LocalDateTime regDt
) {

    public static PostResponse from(PassTradePost p) {
        return new PostResponse(
                p.getPostId(),
                p.getSellerId(),
                p.getUserPass().getSport().getSportNm(),
                null, // ticketName은 필요시 추가 매핑
                p.getTitle(),
                p.getContent(),
                p.getSellQty(),
                p.getSaleAmt(),
                p.getStatusCode(),
                p.getDelYn(),
                p.getRegDt()
        );
    }
}
