package com.project.app.pass_trade.service;

import com.project.app.pass_trade.entity.PassTradePost;
import com.project.app.pass_trade.entity.TradeStatus;
import com.project.app.pass_trade.repository.PassTradePostRepository;
import com.project.app.pass_trade_transaction.entity.PassTradeTransaction;
import com.project.app.pass_trade_transaction.entity.TransactionStatus;
import com.project.app.pass_trade_transaction.repository.PassTradeTransactionRepository;
import com.project.app.payment.entity.Payment;
import com.project.app.payment.service.PassTradePaymentCreator;
import com.project.app.userpass.service.UserPassService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Slf4j
@RequiredArgsConstructor
public class PassTradeCompleteService {

    private final PassTradePostRepository passTradePostRepository;
    private final UserPassService userPassService;
    private final PassTradePaymentCreator passTradePaymentCreator;
    private final PassTradeTransactionRepository passTradeTransactionRepository;

    @Transactional
    public void completeTrade(Long postId, String buyerId, int buyCount) {

        log.error("🔥 COMPLETE API CALLED postId={}, buyerId={}, buyCount={}", postId, buyerId, buyCount);

        PassTradePost post = passTradePostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("거래 게시글이 존재하지 않습니다."));

        // 1️⃣ 상태/수량 검증
        if (post.getTradeStatus() != TradeStatus.SELLING) {
            throw new IllegalStateException("판매 중이 아닌 게시글입니다.");
        }

        if (buyCount <= 0) {
            throw new IllegalArgumentException("구매 수량이 올바르지 않습니다.");
        }

        int originalSellCount = post.getSellCount(); // ⭐ 핵심
        if (originalSellCount < buyCount) {
            throw new IllegalArgumentException("구매 수량 초과");
        }

        if (post.getSellerId().equals(buyerId)) {
            throw new IllegalStateException("본인의 게시글은 구매할 수 없습니다.");
        }

        // 2️⃣ 단가/금액 계산 (감소 BEFORE)
        BigDecimal unitPrice =
                post.getSaleAmount()
                        .divide(BigDecimal.valueOf(originalSellCount), 4, RoundingMode.HALF_UP);

        BigDecimal totalAmount =
                unitPrice.multiply(BigDecimal.valueOf(buyCount));

        // 3️⃣ 판매자 차감
        userPassService.usePassForTrade(
                post.getUserPassId(),
                buyCount,
                "이용권 거래 판매 (게시글 ID: " + postId + ")"
        );

        // 4️⃣ 구매자 증가
        userPassService.addPassForTrade(
                buyerId,
                post.getSportType(),
                buyCount,
                "이용권 거래 구매 (게시글 ID: " + postId + ")"
        );

        // 5️⃣ 게시글 수량 감소 + 상태 변경
        int remain = originalSellCount - buyCount;
        post.setSellCount(remain);

        if (remain == 0) {
            post.setTradeStatus(TradeStatus.SOLD);
        }

        // 6️⃣ 결제 생성
        log.error("① COMPLETE START");

// 6️⃣ 결제 생성
        log.error("② BEFORE PAYMENT CREATE");
        Payment payment = passTradePaymentCreator.create(
                buyerId,
                totalAmount,
                postId,
                "이용권 거래 - " + post.getSportType().getSportNm()
        );
        log.error("③ AFTER PAYMENT CREATE");

// 7️⃣ 거래내역 생성 + 저장
        PassTradeTransaction tx = new PassTradeTransaction();
        tx.setPostId(postId);
        tx.setBuyerId(buyerId);
        tx.setBuyQty(buyCount);
        tx.setTradeAmt(totalAmount);
        tx.setSttsCd(TransactionStatus.COMPLETED);
        tx.setPaymentId(payment.getPayId());

        passTradeTransactionRepository.save(tx);
        log.error("④ AFTER TX SAVE");

// 8️⃣ 게시글 저장
        passTradePostRepository.save(post);
        log.error("⑤ AFTER POST SAVE");

    }

    }
