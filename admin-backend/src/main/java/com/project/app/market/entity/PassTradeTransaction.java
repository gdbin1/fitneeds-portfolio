package com.project.app.market.entity;

import com.project.app.payment.entity.Payment;
import com.project.app.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PASS_TRADE_TRANSACTION")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class PassTradeTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trade_id")
    private Long tradeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private PassTradePost post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_user_id", nullable = false)
    private User buyerUser;

    @Column(name = "trade_amt", nullable = false)
    private BigDecimal tradeAmt;

    @Column(name = "stts_cd", nullable = false, length = 20)
    private String sttsCd; // 거래 상태 (진행중, 완료, 취소 등)

    @CreatedDate
    @Column(name = "reg_dt", nullable = false, updatable = false)
    private LocalDateTime regDt;

    @Column(name = "buy_qty", nullable = false)
    private Integer buyQty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    /**
     * 거래 상태 업데이트
     */
    public void updateStatus(String status) {
        this.sttsCd = status;
    }

    /**
     * 거래 금액 업데이트
     */
    public void updateAmount(BigDecimal amount) {
        if (amount != null && amount.compareTo(BigDecimal.ZERO) > 0) {
            this.tradeAmt = amount;
        }
    }

    /**
     * 구매 수량 업데이트
     */
    public void updateQuantity(Integer quantity) {
        if (quantity != null && quantity > 0) {
            this.buyQty = quantity;
        }
    }
}

