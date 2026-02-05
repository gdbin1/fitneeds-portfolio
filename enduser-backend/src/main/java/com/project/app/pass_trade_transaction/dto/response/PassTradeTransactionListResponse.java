package com.project.app.pass_trade_transaction.dto.response;

import com.project.app.pass_trade_transaction.entity.TransactionStatus;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
public class PassTradeTransactionListResponse {

    private Long transactionId;

    private Long postId;
    private String postTitle;

    private String buyerId;
    private String buyerName;

    private String sellerId;
    private String sellerName;

    private Integer buyQty;
    private BigDecimal tradeAmt;
    private TransactionStatus sttsCd;
    private LocalDateTime regDt;

    // ✅ JPQL 전용 생성자 (이게 핵심)
    public PassTradeTransactionListResponse(
            Long transactionId,
            Long postId,
            String postTitle,
            String buyerId,
            String buyerName,
            String sellerId,
            String sellerName,
            Integer buyQty,
            BigDecimal tradeAmt,
            TransactionStatus sttsCd,
            LocalDateTime regDt
    ) {
        this.transactionId = transactionId;
        this.postId = postId;
        this.postTitle = postTitle;
        this.buyerId = buyerId;
        this.buyerName = buyerName;
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.buyQty = buyQty;
        this.tradeAmt = tradeAmt;
        this.sttsCd = sttsCd;
        this.regDt = regDt;
    }
}
