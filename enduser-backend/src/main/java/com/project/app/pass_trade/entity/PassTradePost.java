package com.project.app.pass_trade.entity;

import com.project.app.sporttype.entity.SportType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PASS_TRADE_POST")
@Data
@NoArgsConstructor
public class PassTradePost {

    /* =========================
     * PK
     * ========================= */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Long postId;

    /* =========================
     * FK / 식별자
     * ========================= */
    @Column(name = "seller_id", nullable = false, length = 50)
    private String sellerId;

    @Column(name = "user_pass_id", nullable = false)
    private Long userPassId;

    /* =========================
     * 거래 정보
     * ========================= */

    // 판매 수량
    @Column(name = "sell_qty", nullable = false)
    private Integer sellCount;

    // 판매 금액 (총 판매 금액 기준)
    @Column(
            name = "sale_amt",
            nullable = false,
            precision = 19,
            scale = 4
    )
    private BigDecimal saleAmount;


    /* =========================
     * 게시글 정보
     * ========================= */

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "cntnt", nullable = false, columnDefinition = "TEXT")
    private String content;

    // 상태 코드 (SELLING / SOLD / CANCELED)
    @Enumerated(EnumType.STRING)
    @Column(name = "stts_cd", nullable = false, length = 20)
    private TradeStatus tradeStatus;

    @PrePersist
    protected void onCreate() {
        this.regDt = LocalDateTime.now();
//        this.updDt = LocalDateTime.now();
        this.deleted = false;
        this.tradeStatus = TradeStatus.SELLING;
    }


    // 판매 사유
//    @Column(name = "reason", nullable = false, length = 300)
//    private String reason;

    /* =========================
     * 삭제 여부
     * ========================= */
    @Column(name = "del_yn", nullable = false)
    private Boolean deleted;

    /* =========================
     * 날짜
     * ========================= */
    @Column(name = "reg_dt")
    private LocalDateTime regDt;

    @Column(
            name = "upd_dt",
            insertable = false,
            updatable = false
    )
    private LocalDateTime updDt;

    /* =========================
     * 게시글 정보
     * ========================= */

    // 종목명 (헬스 / 수영 / 요가 등)
// 프론트 표시 + 거래 히스토리용


    // 종목 FK
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_id", nullable = false)
    private SportType sportType;





    /* =========================
     * LifeCycle
     * ========================= */


    @PreUpdate
    protected void onUpdate() {
        this.updDt = LocalDateTime.now();
    }
}
