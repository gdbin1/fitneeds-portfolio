package com.project.app.payment.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import com.project.app.payment.entity.PaymentPayMethod;
import com.project.app.payment.entity.PaymentPayTypeCd;
import com.project.app.payment.entity.PaymentSttsCd;

/**
 * Payment 도메인 클래스
 * payment 테이블과 매핑
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @JsonProperty("pay_id")
    private Long payId;
    
    @JsonProperty("order_no")
    private String orderNo;
    
    @JsonProperty("brch_id")
    private Long brchId;
    
    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("pay_type_cd")
    private PaymentPayTypeCd payTypeCd;

    @JsonProperty("ref_id")
    private Long refId;
    
    @JsonProperty("pay_amt")
    private Integer payAmt;
    
    @JsonProperty("pay_method")
    private PaymentPayMethod payMethod;

    @JsonProperty("stts_cd")
    private PaymentSttsCd sttsCd;

    @JsonProperty("reg_dt")
    private String regDt;
    
    @JsonProperty("pg_order_no")
    private String pgOrderNo;
}
