package com.project.app.payment.entity;

import com.project.app.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "PAYMENT", indexes = {
		@Index(name = "idx_payment_user_stts", columnList = "user_id, stts_cd"),
		@Index(name = "idx_payment_pay_type_ref", columnList = "pay_type_cd, target_id")
})
public class Payment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "pay_id", nullable = false)
	private Long payId;

	@Column(name = "ord_no", nullable = false, length = 100, unique = true)
	private String ordNo;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(name = "pay_type_cd", nullable = false, length = 20)
	@Enumerated(EnumType.STRING)
	private PaymentPayTypeCd payTypeCd;

	@Column(name = "pay_amt", nullable = false, columnDefinition = "DECIMAL(19,4)")
	private BigDecimal payAmt;

	@Column(name = "pay_method", nullable = false, length = 20 )
	@Enumerated(EnumType.STRING)
	private PaymentPayMethod payMethod;

	@Column(name = "stts_cd", nullable = false, length = 20)
	@Enumerated(EnumType.STRING)
	private PaymentSttsCd sttsCd;

	@CreatedDate // JPA Auditing 설정 필수
    @Column(name = "REG_DT", updatable = false)
    private LocalDateTime regDt;

   @Column(name = "target_id", nullable = false)
	private Long targetId;

	@Column(name = "target_name", nullable = false, length = 100)
	private String targetName;

    @PrePersist
    public void generateOrderNo() {
        if (this.ordNo == null || this.ordNo.isEmpty()) {
            this.ordNo = "PAYMENT-" + UUID.randomUUID().toString();
        }
        if (this.regDt == null) { // @CreatedDate는 JPA Auditing 설정이 안 되어있을 때 null일 수 있음
            this.regDt = LocalDateTime.now();
        }
    }
}