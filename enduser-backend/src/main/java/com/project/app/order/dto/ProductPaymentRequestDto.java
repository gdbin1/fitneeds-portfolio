package com.project.app.order.dto;

import com.project.app.payment.entity.PaymentPayMethod;
import com.project.app.payment.entity.PaymentPayTypeCd;

import java.math.BigDecimal;

/**
 * Order 패키지에서 사용하는 결제 요청 DTO
 */
public class ProductPaymentRequestDto {
    private String userId;
    private Long prodId;
    private PaymentPayTypeCd payTypeCd;
    private PaymentPayMethod payMethod;
    private BigDecimal amount;
    private Long schdId;
    private String reservationDate;
    private String reservationTime;
    private Long userPassId;
    private String paymentDetails;
    private Long targetId;
    private String targetName;

    public ProductPaymentRequestDto() {}

    public ProductPaymentRequestDto(String userId, Long prodId, PaymentPayTypeCd payTypeCd, PaymentPayMethod payMethod, BigDecimal amount,
                                    Long schdId, String reservationDate, String reservationTime, Long userPassId, String paymentDetails,
                                    Long targetId, String targetName) {
        this.userId = userId;
        this.prodId = prodId;
        this.payTypeCd = payTypeCd;
        this.payMethod = payMethod;
        this.amount = amount;
        this.schdId = schdId;
        this.reservationDate = reservationDate;
        this.reservationTime = reservationTime;
        this.userPassId = userPassId;
        this.paymentDetails = paymentDetails;
        this.targetId = targetId;
        this.targetName = targetName;
    }

    // 기존 코드에서 record처럼 req.userId() 형태로 접근하므로 동일한 메서드 이름 제공
    public String userId() { return userId; }
    public Long prodId() { return prodId; }
    public PaymentPayTypeCd payTypeCd() { return payTypeCd; }
    public PaymentPayMethod payMethod() { return payMethod; }
    public BigDecimal amount() { return amount; }
    public Long schdId() { return schdId; }
    public String reservationDate() { return reservationDate; }
    public String reservationTime() { return reservationTime; }
    public Long userPassId() { return userPassId; }
    public String paymentDetails() { return paymentDetails; }
    public Long targetId() { return targetId; }
    public String targetName() { return targetName; }

    // Jackson을 위한 setter 메서드 추가
    public void setUserId(String userId) { this.userId = userId; }
    public void setProdId(Long prodId) { this.prodId = prodId; }
    public void setPayTypeCd(PaymentPayTypeCd payTypeCd) { this.payTypeCd = payTypeCd; }
    public void setPayMethod(PaymentPayMethod payMethod) { this.payMethod = payMethod; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setSchdId(Long schdId) { this.schdId = schdId; }
    public void setReservationDate(String reservationDate) { this.reservationDate = reservationDate; }
    public void setReservationTime(String reservationTime) { this.reservationTime = reservationTime; }
    public void setUserPassId(Long userPassId) { this.userPassId = userPassId; }
    public void setPaymentDetails(String paymentDetails) { this.paymentDetails = paymentDetails; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }
    public void setTargetName(String targetName) { this.targetName = targetName; }
}
