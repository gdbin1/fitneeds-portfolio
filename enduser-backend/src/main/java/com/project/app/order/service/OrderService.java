package com.project.app.order.service;

import java.util.UUID;

import com.project.app.order.dto.ProductPaymentRequestDto;
import com.project.app.order.dto.ProductPaymentResponseDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.app.payment.entity.Payment;
import com.project.app.payment.entity.PaymentSttsCd;
import com.project.app.payment.repository.PaymentRepository;
import com.project.app.product.repository.PassProductRepository;
import com.project.app.user.entity.User;
import com.project.app.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PassProductRepository passProductRepository;

    @Transactional
    public ProductPaymentResponseDto createOrder(ProductPaymentRequestDto req) {
        User user = userRepository.findByUserId(req.userId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        var prod = passProductRepository.findById(req.prodId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        String ordNo = "ORD-" + UUID.randomUUID();

        // payTypeCd: 결제 유형 (PASS_PURCHASE, SCHEDULE_RESERVATION, PASS_TRADE)
        // refId: 결제 대상 참조 ID (예: prodId가 이용권결제시 참조)
        // payMethod: 결제 수단 (CARD, REMITTANCE, POINT, PASS)
        // sttsCd: 결제 상태 (PENDING, PAID, CANCELED, FAILED)
        Payment p = Payment.builder()
                .ordNo(ordNo)
                .user(user)
                .payTypeCd(req.payTypeCd())
                                .payAmt(prod.getProdAmt())
                .payMethod(req.payMethod())
                .targetId(prod.getProdId())
                .targetName(prod.getProdNm())
                .sttsCd(PaymentSttsCd.PENDING)
                .build();

        p = paymentRepository.save(p);

        return new ProductPaymentResponseDto(
                p.getPayId(),
                p.getOrdNo(),
                p.getSttsCd(),
                p.getPayAmt(),
                p.getRegDt()
        );
    }
}
