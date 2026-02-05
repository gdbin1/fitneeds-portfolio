package com.project.app.userpass.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.app.sporttype.entity.SportType;
import com.project.app.sporttype.repository.SportTypeRepository;
import com.project.app.user.entity.User;
import com.project.app.user.repository.UserRepository;
import com.project.app.userpass.entity.PassLogChgTypeCd;
import com.project.app.userpass.entity.PassStatusCd;
import com.project.app.userpass.entity.UserPass;
import com.project.app.userpass.repository.UserPassRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserPassTradeService {

    private final UserPassRepository userPassRepository;
    private final UserRepository userRepository;
    private final SportTypeRepository sportTypeRepository;
    private final PassLogService passLogService;

    /**
     * 판매자 이용권 차감 (거래 판매)
     * - 소유 검증 + 상태 검증 + 수량 검증
     * - 감소 후 로그 남김(TRADE_SELL)
     */
    @Transactional
    public UserPass decreaseForTrade(Long userPassId, String sellerId, int buyQty, String reason) {
        if (buyQty <= 0) {
            throw new IllegalArgumentException("buyQty는 1 이상이어야 합니다.");
        }

        UserPass sellerPass = userPassRepository
                .findByUserPassIdAndUser_UserId(userPassId, sellerId)
                .orElseThrow(() -> new IllegalArgumentException("판매자의 이용권을 찾을 수 없습니다."));

        if (sellerPass.getPassStatusCd() != PassStatusCd.ACTIVE) {
            throw new IllegalStateException("판매할 수 없는 이용권 상태입니다.");
        }

        Integer rmn = sellerPass.getRmnCnt();
        if (rmn == null || rmn < buyQty) {
            throw new IllegalStateException("판매자의 이용권 수량이 부족합니다.");
        }

        // ✅ 엔티티 비즈니스 메서드 사용 (팩트 기반)
        for (int i = 0; i < buyQty; i++) {
            boolean ok = sellerPass.decreaseRmnCnt();
            if (!ok) {
                throw new IllegalStateException("판매자 이용권 차감 실패(잔여 부족).");
            }
        }



        UserPass saved = userPassRepository.save(sellerPass);

        // ✅ 거래 판매 로그
        passLogService.createPassLog(
                saved,
                PassLogChgTypeCd.TRADE_SELL,
                -buyQty,
                (reason != null ? reason : "이용권 거래 판매"),
                null
        );

        return saved;
    }

    /**
     * 구매자 이용권 증가(거래 구매)
     * - 구매자에게 같은 sportId 이용권이 있으면 증가
     * - 없으면 신규 생성 후 증가
     * - 로그 남김(TRADE_BUY)
     */
    @Transactional
    public UserPass increaseOrCreateForTrade(String buyerId, Long sportId, int buyQty, Long lstProdId, String reason) {
        if (buyQty <= 0) {
            throw new IllegalArgumentException("buyQty는 1 이상이어야 합니다.");
        }

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new IllegalArgumentException("구매자(User)를 찾을 수 없습니다. buyerId=" + buyerId));

        SportType sportType = sportTypeRepository.findById(sportId)
                .orElseThrow(() -> new IllegalArgumentException("SportType을 찾을 수 없습니다. sportId=" + sportId));

        UserPass buyerPass = userPassRepository
                .findByUser_UserIdAndSportType_SportId(buyerId, sportId)
                .orElseGet(() -> {
                    // ✅ 신규 생성 (unique(user_id, sport_id) 준수)
                    UserPass created = new UserPass();
                    created.setUser(buyer);
                    created.setSportType(sportType);
                    created.setPassStatusCd(PassStatusCd.ACTIVE);
                    created.setRmnCnt(0);
                    created.setInitCnt(0); // 아래에서 증가분 반영
                    created.setLstProdId(lstProdId);

                    return created;
                });

        // 증가 처리
        for (int i = 0; i < buyQty; i++) {
            boolean ok = buyerPass.increaseRmnCnt();
            if (!ok) {
                throw new IllegalStateException("구매자 이용권 증가 실패(초기 수량 제한 등).");
            }
        }

        // initCnt 정책:
        // - 거래는 "추가 횟수" 개념이므로, initCnt를 누적시키는 게 가장 자연스럽고 안전함
        // - ( 프로젝트가 initCnt를 '최초 구매'로만 쓰려면 이 부분만 팀 규칙에 맞춰 조정)
        int currentInit = (buyerPass.getInitCnt() == null) ? 0 : buyerPass.getInitCnt();
        buyerPass.setInitCnt(currentInit + buyQty);

        buyerPass.setLstProdId(lstProdId);

        UserPass saved = userPassRepository.save(buyerPass);

        // ✅ 거래 구매 로그
        passLogService.createPassLog(
                saved,
                PassLogChgTypeCd.TRADE_BUY,
                buyQty,
                (reason != null ? reason : "이용권 거래 구매"),
                null
        );

        return saved;
    }
}
