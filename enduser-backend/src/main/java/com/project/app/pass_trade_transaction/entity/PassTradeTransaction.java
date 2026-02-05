package com.project.app.pass_trade_transaction.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PASS_TRADE_TRANSACTION")
@Data
@NoArgsConstructor
public class PassTradeTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trade_id")
    private Long transactionId;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "buyer_user_id", nullable = false)
    private String buyerId;

//    @Column(name = "seller_id", nullable = false)
//    private String sellerId;

    @Column(name = "buy_qty", nullable = false)
    private Integer buyQty;

    @Column(
            name = "trade_amt",
            nullable = false,
            precision = 19,
            scale = 4
    )
    private BigDecimal tradeAmt;


    @Enumerated(EnumType.STRING)
    @Column(name = "stts_cd", nullable = false)
    private TransactionStatus sttsCd = TransactionStatus.REQUESTED;

    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "reg_dt", updatable = false)
    private LocalDateTime regDt;

//    @Column(name = "upd_dt")
//    private LocalDateTime updDt;

    @PrePersist
    protected void onCreate() {
        this.regDt = LocalDateTime.now();
//        this.updDt = LocalDateTime.now();
    }

}