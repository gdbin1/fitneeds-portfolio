package com.project.app.product.entity;


import com.project.app.aspect.BaseTimeEntity;
import com.project.app.sporttype.entity.SportType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;

@Entity
@Table(name = "PASS_PRODUCT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PassProduct extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prod_id")
    private Long prodId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_id", nullable = false)
    private SportType sport;

    @Column(name = "prod_nm", nullable = false, length = 100)
    private String prodNm;

    @Column(name = "prod_amt", nullable = false)
    private BigDecimal prodAmt;

    @Column(name = "prv_cnt", nullable = false)
    private Integer prvCnt;

    @Column(name = "use_yn", nullable = false)
    @ColumnDefault("1")
    private Boolean useYn;


    @Builder
    public PassProduct(SportType sport, String prodNm, BigDecimal prodAmt, Integer prvCnt) {
        this.sport = sport;
        this.prodNm = prodNm;
        this.prodAmt = prodAmt;
        this.prvCnt = prvCnt;
        this.useYn = true;
    }

    public void updateInfo(String prodNm, BigDecimal prodAmt, Integer prvCnt) {
        this.prodNm = prodNm;
        this.prodAmt = prodAmt;
        this.prvCnt = prvCnt;
    }

    public void updateStatus(Boolean useYn) {
        this.useYn = useYn;
    }
}

