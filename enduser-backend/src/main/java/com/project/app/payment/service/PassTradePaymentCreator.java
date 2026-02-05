package com.project.app.payment.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.app.payment.entity.Payment;
import com.project.app.payment.entity.PaymentPayMethod;
import com.project.app.payment.entity.PaymentPayTypeCd;
import com.project.app.payment.entity.PaymentSttsCd;
import com.project.app.payment.repository.PaymentRepository;
import com.project.app.user.entity.User;
import com.project.app.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PassTradePaymentCreator {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    @Transactional
    public Payment create(
            String buyerId,
            BigDecimal amount,
            Long postId,
            String targetName
    ) {
        User user = userRepository.findByUserId(buyerId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        Payment payment = Payment.builder()
                .user(user)
                .payTypeCd(PaymentPayTypeCd.PASS_TRADE)
                .payMethod(PaymentPayMethod.PASS)
                .sttsCd(PaymentSttsCd.PAID)
                .payAmt(amount)
                .targetId(postId)
                .targetName(targetName)
                .build();

        return paymentRepository.save(payment); // ⭐ 핵심
    }
}
