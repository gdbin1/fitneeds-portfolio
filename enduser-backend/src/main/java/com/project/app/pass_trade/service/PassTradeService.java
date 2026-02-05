package com.project.app.pass_trade.service;

import com.project.app.pass_trade.entity.PassTradePost;
import com.project.app.pass_trade.entity.TradeStatus;
import com.project.app.pass_trade.dto.request.PassTradeBuyRequest;
import com.project.app.pass_trade.dto.request.PassTradePostCreateRequest;
import com.project.app.pass_trade_transaction.entity.PassTradeTransaction;
import com.project.app.pass_trade.dto.request.PassTradePostUpdateRequest;

import com.project.app.pass_trade.dto.response.PassTradePostResponse;
import com.project.app.pass_trade_transaction.dto.response.PassTradeTransactionResponse;
import com.project.app.pass_trade.repository.PassTradePostRepository;
import com.project.app.pass_trade_transaction.entity.TransactionStatus;
import com.project.app.pass_trade_transaction.repository.PassTradeTransactionRepository;

import com.project.app.pass_trade_favorite.service.PassTradeFavoriteService;
import com.project.app.payment.service.PaymentService;
import com.project.app.user.entity.User;
import com.project.app.user.repository.UserRepository;
import com.project.app.userpass.entity.PassStatusCd;
import com.project.app.userpass.entity.UserPass;
import com.project.app.userpass.repository.UserPassRepository;
import com.project.app.userpass.service.UserPassTradeService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PassTradeService {

    private final PassTradePostRepository passTradePostRepository;
    private final PassTradeTransactionRepository passTradeTransactionRepository;

    //  조회용(검증용) — 상태 확인/값 참조용으로만 사용 (상태 변경은 tradeService로만)
    private final UserPassRepository userPassRepository;

    //  상태 변경/생성/로그는 여기로 단일화
    private final UserPassTradeService userPassTradeService;

    //  결제 생성용
    private final PaymentService paymentService;

    private final UserRepository userRepository;

    private final PassTradeFavoriteService passTradeFavoriteService;

    // 거래 게시글 등록
    @Transactional
    public PassTradePostResponse createTradePost(String sellerId, PassTradePostCreateRequest request) {

        // 1️⃣ 판매자 이용권 조회
        UserPass sellerPass = userPassRepository
                .findByUserPassIdAndUser_UserId(request.getUserPassId(), sellerId)
                .orElseThrow(() -> new RuntimeException("보유하지 않은 이용권입니다."));

        if (sellerPass.getPassStatusCd() != PassStatusCd.ACTIVE) {
            throw new RuntimeException("판매할 수 없는 이용권 상태입니다.");
        }

        if (sellerPass.getRmnCnt() == null || sellerPass.getRmnCnt() < request.getSellCount()) {
            throw new RuntimeException("판매 수량이 보유 수량을 초과합니다.");
        }

        if (request.getSellCount() == null || request.getSellCount() <= 0) {
            throw new IllegalArgumentException("판매 수량은 1 이상이어야 합니다.");
        }

        if (request.getSaleAmount() == null
                || request.getSaleAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("판매 금액은 1원 이상이어야 합니다.");
        }

        // 2️⃣ 게시글 생성 (여기서부터 post 사용)
        PassTradePost post = new PassTradePost();

        post.setSellerId(sellerId);
        post.setUserPassId(request.getUserPassId());
        post.setSellCount(request.getSellCount());
        post.setSaleAmount(request.getSaleAmount());
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());

        // ⭐ 핵심: 상태 명시
        post.setTradeStatus(TradeStatus.SELLING);
        post.setDeleted(false);

        // sportType 반드시 세팅
        post.setSportType(sellerPass.getSportType());

        // 3️⃣ 저장
        PassTradePost savedPost = passTradePostRepository.save(post);

        return convertToPostResponse(savedPost);

    }



    // 본인 게시글 삭제
    @Transactional
    public void deleteMyPost(Long postId, String sellerId) {
        PassTradePost post = passTradePostRepository
                .findByPostIdAndSellerIdAndDeletedFalse(postId, sellerId)
                .orElseThrow(() -> new RuntimeException("삭제할 수 없는 게시글입니다."));

        // SELLING 상태만 삭제 가능
        if (post.getTradeStatus() != TradeStatus.SELLING) {
            throw new IllegalStateException("판매 중인 게시글만 삭제할 수 있습니다.");
        }

        post.setDeleted(true);
        passTradePostRepository.save(post);
    }


    // 본인 게시글 수정
    @Transactional
    public PassTradePostResponse updateMyPost(
            Long postId,
            String sellerId,
            PassTradePostUpdateRequest request
    ) {
        PassTradePost post = passTradePostRepository
                .findByPostIdAndSellerIdAndDeletedFalse(postId, sellerId)
                .orElseThrow(() -> new RuntimeException("수정할 수 없는 게시글입니다."));

        if (post.getTradeStatus() != TradeStatus.SELLING) {
            throw new IllegalStateException("판매 중인 게시글만 수정할 수 있습니다.");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setSellCount(request.getSellCount());
        post.setSaleAmount(request.getSaleAmount());

        PassTradePost saved = passTradePostRepository.save(post);
        return convertToPostResponse(saved);
    }




    // 활성 거래 게시글 목록 조회
    @Transactional(readOnly = true)
    public List<PassTradePostResponse> getActiveTradePosts() {


        return passTradePostRepository
                .findActiveWithSport(TradeStatus.SELLING)
                .stream()
                .map(this::convertToPostResponse)
                .collect(Collectors.toList());
    }

    // 즉시 구매 처리
    @Transactional
    public PassTradeTransactionResponse buyTrade(Long postId, String buyerId, PassTradeBuyRequest request) {

        // 1) 게시글 비관적 락 조회
        PassTradePost post = passTradePostRepository
                .findByIdWithLock(postId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 거래 게시글입니다."));

        // 2) 상태 검증
        if (post.getTradeStatus() != TradeStatus.SELLING) {
            throw new RuntimeException("판매 중이 아닌 게시글입니다.");
        }

        // 3) 판매자 ≠ 구매자
        if (post.getSellerId().equals(buyerId)) {
            throw new RuntimeException("본인의 게시글은 구매할 수 없습니다.");
        }

        Integer buyQty = request.getBuyQty();

        // 4) 구매 수량 검증
        if (buyQty == null || buyQty <= 0) {
            throw new IllegalArgumentException("구매 수량은 1 이상이어야 합니다.");
        }

        if (buyQty > post.getSellCount()) {
            throw new RuntimeException("구매 수량이 판매 수량을 초과합니다.");
        }

        if (post.getSellCount() == 0) {
            throw new IllegalStateException("판매 수량이 0인 게시글입니다.");
        }

        // 5) 금액 계산
        // 단가 = 총판매금액 / 총판매수량
        BigDecimal unitPrice =
                post.getSaleAmount()
                        .divide(
                                BigDecimal.valueOf(post.getSellCount()),
                                4,
                                RoundingMode.HALF_UP
                        );

// 거래 금액 = 단가 * 구매 수량
        BigDecimal tradeAmt =
                unitPrice.multiply(BigDecimal.valueOf(buyQty));


        // 6) 거래 트랜잭션 생성 (결제는 나중에 → paymentId는 null)
        PassTradeTransaction transaction = new PassTradeTransaction();
        transaction.setPostId(postId);
        transaction.setBuyerId(buyerId);
//        transaction.setSellerId(post.getSellerId());
        transaction.setBuyQty(buyQty);
        transaction.setTradeAmt(tradeAmt);
        transaction.setSttsCd(TransactionStatus.COMPLETED);
        transaction.setPaymentId(null);

        PassTradeTransaction savedTransaction = passTradeTransactionRepository.save(transaction);

        // 7) 판매자 차감 + 로그 (userpass 쪽 단일 진입점)
        UserPass sellerPassAfter = userPassTradeService.decreaseForTrade(
                post.getUserPassId(),
                post.getSellerId(),
                buyQty,
                "이용권 거래 판매 (거래ID: " + savedTransaction.getTransactionId() + ")"
        );

        // 8) 구매자 증가/생성 + 로그 (userpass 쪽 단일 진입점)
        Long sportId = sellerPassAfter.getSportType().getSportId();
        Long lstProdId = sellerPassAfter.getLstProdId();

        userPassTradeService.increaseOrCreateForTrade(
                buyerId,
                sportId,
                buyQty,
                lstProdId,
                "이용권 거래 구매 (거래ID: " + savedTransaction.getTransactionId() + ")"
        );

        // 9) 게시글 상태 SELLING → SOLD
        post.setTradeStatus(TradeStatus.SOLD);
        passTradePostRepository.save(post);

        return convertToTransactionResponse(savedTransaction);
    }

    // DTO 변환 메서드
    private PassTradePostResponse convertToPostResponse(PassTradePost post) {
        PassTradePostResponse response = new PassTradePostResponse();
        response.setPostId(post.getPostId());
        response.setSellerId(post.getSellerId());
        response.setUserPassId(post.getUserPassId());
        response.setSellCount(post.getSellCount());
        response.setSaleAmount(post.getSaleAmount());
        response.setTitle(post.getTitle());
        response.setContent(post.getContent());
        response.setTradeStatus(post.getTradeStatus());
        response.setRegDt(post.getRegDt());



        // ✅ 종목명
        response.setSportNm(
                post.getSportType().getSportNm()
        );

        // ✅ 판매자 닉네임 (이게 핵심)
        User seller = userRepository.findByUserId(post.getSellerId())
                .orElseThrow(() -> new RuntimeException("판매자 정보 없음"));

        response.setSellerName(seller.getUserName());

        return response;
    }

    private PassTradeTransactionResponse convertToTransactionResponse(PassTradeTransaction transaction) {
        PassTradeTransactionResponse response = new PassTradeTransactionResponse();
        response.setTransactionId(transaction.getTransactionId());
        response.setPostId(transaction.getPostId());
        response.setBuyerId(transaction.getBuyerId());
//        response.setSellerId(transaction.getSellerId());
        response.setBuyQty(transaction.getBuyQty());
        response.setTradeAmt(transaction.getTradeAmt());
        response.setSttsCd(transaction.getSttsCd());
        response.setPaymentId(transaction.getPaymentId());
        response.setRegDt(transaction.getRegDt());
//        response.setUpdDt(transaction.getUpdDt());
        return response;
    }

    // 즐겨찾기 토글
    @Transactional
    public void toggleFavorite(String userId, Long postId) {

        // 이미 즐겨찾기 되어 있는지 확인
        boolean isFavorite = passTradeFavoriteService.isFavorite(userId, postId);

        if (isFavorite) {
            // 이미 즐겨찾기 상태 → 제거
            passTradeFavoriteService.removeFavorite(userId, postId);
        } else {
            // 즐겨찾기 안 된 상태 → 추가
            passTradeFavoriteService.addFavorite(userId, postId);
        }
    }
}