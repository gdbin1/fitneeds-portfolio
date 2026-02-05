package com.project.app.product.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * PassProduct 도메인 클래스
 * pass_product 테이블과 매핑
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PassProduct {
    @JsonProperty("prod_id")
    private Long prodId;

    @JsonProperty("sport_id")
    private Long sportId;

    @JsonProperty("brch_id")
    private Long brchId;

    @JsonProperty("prod_nm")
    private String prodNm;

    @JsonProperty("prod_amt")
    private Integer prodAmt;

    @JsonProperty("prv_cnt")
    private Integer prvCnt;

    @JsonProperty("use_yn")
    private Integer useYn;

    @JsonProperty("reg_dt")
    private String regDt;

    @JsonProperty("upd_dt")
    private String updDt;

    @JsonProperty("mod_user_id")
    private String modUserId;
}
