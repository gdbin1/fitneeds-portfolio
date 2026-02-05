package com.project.app.market.service;

import com.project.app.market.dto.*;
import com.project.app.market.entity.PassTradePost;
import com.project.app.market.entity.PassTradeTransaction;
import com.project.app.market.mapper.MarketMapper;
import com.project.app.market.repository.MarketPostRepository;
import com.project.app.market.repository.MarketTradeRepository;
import com.project.app.ticket.entity.PassLog;
import com.project.app.ticket.entity.PassLogChgTypeCd;
import com.project.app.ticket.entity.PassStatusCd;
import com.project.app.ticket.entity.UserPass;
import com.project.app.ticket.repository.PassLogRepository;
import com.project.app.ticket.repository.UserPassRepository;
import com.project.app.user.entity.User;
import com.project.app.user.repository.UserRepository;
import com.project.app.userAdmin.entity.UserAdmin;
import com.project.app.userAdmin.repository.UserAdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminMarketService {

    private final PassLogRepository passLogRepository;
    private final UserAdminRepository userAdminRepository;
    private final MarketPostRepository postRepository;
    private final MarketTradeRepository tradeRepository;
    private final UserPassRepository userPassRepository;
    private final UserRepository userRepository;
    private final MarketMapper marketMapper;

    // --- Post Methods ---

    public List<PostResponse> getTradePostList(PostSearchRequest request) {
        return marketMapper.selectPostList(request);
    }

    public PostResponse getTradePostDetail(Long id) {
        return PostResponse.from(findPostById(id));
    }

    @Transactional
    public void updateTradePost(Long id, PostUpdateRequest request) {
        PassTradePost post = findPostById(id);
        post.updateInfo(request.title(), request.content(), request.saleAmt());
    }

    @Transactional
    public void updateTradePostStatus(Long id, String status) {
        PassTradePost post = findPostById(id);
        post.updateStatus(status);
        log.info("게시글 상태 변경: postId={}, status={}", id, status);
    }

    @Transactional
    public void deleteTradePost(Long id) {
        PassTradePost post = findPostById(id);
        post.delete();
    }

    // --- Trade Methods ---

    public List<TradeResponse> getTradeList(TradeSearchRequest request) {
        return marketMapper.selectTradeList(request);
    }

    public TradeResponse getTradeDetail(Long id) {
        PassTradeTransaction t = findTradeById(id);
        return new TradeResponse(
                t.getTradeId(),
                t.getPost().getPostId(),
                t.getPost().getTitle(),
            t.getPost().getUserPass().getSport().getSportNm(),
                t.getPost().getSellerId(),
                t.getBuyerUser().getUserId(),
                t.getTradeAmt(),
                t.getBuyQty(),
                t.getSttsCd(),
                t.getRegDt()
        );
    }

    /**
     * 거래 상태 변경 (핵심 로직)
     * 관리자가 'CANCELED'로 변경 시 티켓 복구 및 회수 이력을 남깁니다.
     */
    @Transactional
    public void updateTradeStatus(Long id, String status, String adminId) {
        PassTradeTransaction trade = findTradeById(id);
        String oldStatus = trade.getSttsCd();

        // 1. 상태 업데이트
        trade.updateStatus(status);

        // 2. 상태 변화에 따른 티켓 이동 처리
        if ("COMPLETED".equals(status) && !"COMPLETED".equals(oldStatus)) {
            // [신규] 거래 성공 시: 판매자 -> 구매자 티켓 이동
            processTradeCompletion(trade, adminId);
        } else if ("CANCELED".equals(status) && "COMPLETED".equals(oldStatus)) {
            // [기존] 완료된 거래 취소 시: 구매자 -> 판매자 롤백
            processTradeRollback(trade, adminId);
        }

        // 3. 게시글 상태 자동 관리
        if ("COMPLETED".equals(status)) {
            trade.getPost().updateStatus("SOLD_OUT");
        } else if ("CANCELED".equals(status)) {
            trade.getPost().updateStatus("ON_SALE");
        }
    }

    /**
     * [신규] 거래 성공 처리: 판매자 이용권 차감 및 구매자 이용권 부여
     */
    private void processTradeCompletion(PassTradeTransaction trade, String adminId) {
        Integer qty = trade.getBuyQty();
        PassTradePost post = trade.getPost();
        UserAdmin adminUser = findAdminById(adminId);

        // 1) 판매자(Seller) 처리
        UserPass sellerPass = post.getUserPass();

        if (sellerPass.getRemainingCount() < trade.getBuyQty()) {
            throw new IllegalStateException("판매자의 잔여 이용권 횟수가 부족합니다.");
        }
        // 판매자의 이용권을 차감하고 로그를 남깁니다.
        sellerPass.deductCount(qty);
        savePassLog(sellerPass, PassLogChgTypeCd.TRADE_SELL, -qty,
                String.format("거래완료 판매(거래ID:%d, 구매자:%s)", trade.getTradeId(), trade.getBuyerUser().getUserId()), adminUser);

        // 2) 구매자(Buyer) 처리: 이용권 조회 후 증감 또는 생성
        String buyerId = trade.getBuyerUser().getUserId();
        Long sportId = sellerPass.getSport().getSportId();

        UserPass buyerPass = userPassRepository.findByUserIdAndSportId(buyerId, sportId)
                .orElseGet(() -> createNewPassForBuyer(trade, sellerPass, qty));

        if (buyerPass.getPassId() != null) {
            // 기존 이용권이 있는 경우 횟수 추가
            buyerPass.topUp(qty);
        }

        userPassRepository.save(buyerPass);

        savePassLog(buyerPass, PassLogChgTypeCd.TRADE_BUY, qty,
                String.format("거래완료 구매(거래ID:%d, 판매자:%s)", trade.getTradeId(), sellerPass.getUser().getUserId()), adminUser);
    }

    /**
     * 구매자의 해당 종목 이용권이 없을 경우 신규 생성
     */
    private UserPass createNewPassForBuyer(PassTradeTransaction trade, UserPass sellerPass, int qty) {
        User buyer = userRepository.findById(trade.getBuyerUser().getUserId())
                .orElseThrow(() -> new IllegalArgumentException("구매자를 찾을 수 없습니다."));

        return UserPass.builder()
                .user(buyer)
                .sport(sellerPass.getSport())
                .passStatusCode(PassStatusCd.ACTIVE)
                .remainingCount(qty)
                .initCount(qty)
                .lastProdId(sellerPass.getLastProdId())
                .build();
    }

    /**
     * 이용권 수량 원복 및 PassLog 기록
     */
    private void processTradeRollback(PassTradeTransaction trade, String adminId) {
        Integer qty = trade.getBuyQty();
        Long tradeId = trade.getTradeId();
        String buyerId = trade.getBuyerUser().getUserId();

        // 처리자(관리자) 조회
        UserAdmin adminUser = userAdminRepository.findByUserId(adminId)
                .orElseThrow(() -> new IllegalArgumentException("관리자 정보 없음: " + adminId));

        // 1) 판매자(Seller) 이용권 복구
        UserPass sellerPass = trade.getPost().getUserPass();
        sellerPass.restore(qty);

        savePassLog(sellerPass, PassLogChgTypeCd.TRADE_CANCEL, qty,
                String.format("거래취소 복구(거래ID:%d, 구매자:%s)", tradeId, buyerId), adminUser);

        // 2) 구매자(Buyer) 이용권 회수
        Long sportId = sellerPass.getSport().getSportId();
        UserPass buyerPass = userPassRepository.findByUserIdAndSportId(buyerId, sportId)
                .orElseThrow(() -> new IllegalStateException("구매자의 이용권을 찾을 수 없습니다."));

        buyerPass.deductCount(qty);

        savePassLog(buyerPass, PassLogChgTypeCd.TRADE_RECALL, -qty,
                String.format("거래취소 회수(거래ID:%d, 판매자:%s)", tradeId, sellerPass.getUser().getUserId()), adminUser);

        log.info("관리자 거래 취소 완료: 거래ID={}, 판매자={}, 구매자={}, 수량={}",
                tradeId, sellerPass.getUser().getUserId(), buyerId, qty);
    }

    private void savePassLog(UserPass userPass, PassLogChgTypeCd type, int amount, String reason, UserAdmin admin) {
        PassLog passLog = PassLog.builder()
                .userPass(userPass)
                .chgTypeCd(type)
                .chgCnt(amount)
                .chgRsn(reason)
                .processedBy(admin)
                .build();
        passLogRepository.save(passLog);
    }

    private PassTradePost findPostById(Long id) {
        return postRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("게시글 없음"));
    }

    private PassTradeTransaction findTradeById(Long id) {
        return tradeRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("거래 내역 없음"));
    }

    private UserAdmin findAdminById(String adminId) {
        return userAdminRepository.findByUserId(adminId)
                .orElseThrow(() -> new IllegalArgumentException("관리자 정보 없음: " + adminId));
    }
}
