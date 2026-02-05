package com.project.app.market.entity;


import com.project.app.global.entity.BaseTimeEntity;
import com.project.app.ticket.entity.UserPass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;

@Entity
@Table(name = "PASS_TRADE_POST")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PassTradePost extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Long postId;

    @Column(name = "seller_id", nullable = false, length = 50)
    private String sellerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_pass_id", nullable = false)
    private UserPass userPass; // 판매 대상 이용권

    @Column(nullable = false)
    private String title;

    @Column(name = "cntnt", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "sell_qty", nullable = false)
    private Integer sellQty;

    @Column(name = "sale_amt", nullable = false)
    private BigDecimal saleAmt;

    @Column(name = "stts_cd", nullable = false)
    private String statusCode; // 판매중, 예약중, 판매완료

    @Column(name = "del_yn", nullable = false)
    @ColumnDefault("0")
    private Boolean delYn;

    /**
     * 게시글 정보 업데이트
     */
    public void updateInfo(String title, String content, BigDecimal saleAmt) {
        if (title != null) {
            this.title = title;
        }
        if (content != null) {
            this.content = content;
        }
        if (saleAmt != null) {
            this.saleAmt = saleAmt;
        }
    }

    /**
     * 게시글 상태 업데이트
     */
    public void updateStatus(String statusCode) {
        this.statusCode = statusCode;
    }

    /**
     * 게시글 삭제
     */
    public void delete() {
        this.delYn = true;
    }
}
