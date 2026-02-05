package com.project.app.pass_trade_transaction.dto.response;
import com.project.app.pass_trade_transaction.entity.PassTradeTransaction;
import com.project.app.pass_trade_transaction.entity.TransactionStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PassTradeTransactionResponse {

    private Long transactionId;     // 거래 ID
    private Long postId;            // 게시글 ID

    private String buyerId;         // 구매자 ID
    private Integer buyQty;         // 거래 수량
    private BigDecimal tradeAmt;    // 거래 금액

    private TransactionStatus sttsCd; // 거래 상태
    private LocalDateTime regDt;
    private Long paymentId; // 거래 일시

    /**
     * Entity → DTO 변환
     */
    public static PassTradeTransactionResponse from(PassTradeTransaction tx) {
        PassTradeTransactionResponse res = new PassTradeTransactionResponse();
        res.setTransactionId(tx.getTransactionId());
        res.setPostId(tx.getPostId());
        res.setBuyerId(tx.getBuyerId());
        res.setBuyQty(tx.getBuyQty());
        res.setTradeAmt(tx.getTradeAmt());
        res.setSttsCd(tx.getSttsCd());
        res.setRegDt(tx.getRegDt());

        return res;
    }
}
