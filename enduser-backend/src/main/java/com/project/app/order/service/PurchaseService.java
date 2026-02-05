package com.project.app.order.service;

import java.util.UUID;
import java.time.LocalDateTime;

import com.project.app.userpass.entity.PassStatusCd;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.app.order.dto.ProductPaymentRequestDto;
import com.project.app.order.dto.PurchaseResponseDto;
import com.project.app.payment.entity.Payment;
import com.project.app.payment.entity.PaymentSttsCd;
import com.project.app.payment.repository.PaymentRepository;
import com.project.app.product.repository.PassProductRepository;
import com.project.app.user.entity.User;
import com.project.app.user.repository.UserRepository;
import com.project.app.userpass.entity.PassLog;
import com.project.app.userpass.entity.PassLogChgTypeCd;
import com.project.app.userpass.entity.UserPass;
import com.project.app.userpass.repository.PassLogRepository;
import com.project.app.userpass.repository.UserPassRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PassProductRepository passProductRepository;
    private final UserPassRepository userPassRepository;
    private final PassLogRepository passLogRepository;

    /**
     * PG 연동 없이, 결제 수단을 선택하면 즉시 결제 성공으로 간주하고
     * Payment 엔티티를 저장한 뒤 이용권을 지급합니다.
     * 같은 userId, sportId가 있는 경우 기존 UserPass의 잔여횟수(rmnCnt)를 증가시키고
     * 없으면 새 UserPass를 생성합니다.
     * initCnt는 구매한 총량을 누적합니다.
     *
     * 필드 의미 정리:
     * - payTypeCd: 결제 유형 (PASS_PURCHASE, SCHEDULE_RESERVATION, PASS_TRADE)
     * - refId(prodId): 결제 대상 참조 ID (이용권결제일 경우 이용권상품ID 등)
     * - payMethod: 결제 수단 (CARD, REMITTANCE, POINT, PASS)
     * - sttsCd: 결제 상태 (PENDING, PAID, CANCELED, FAILED)
     */
    @Transactional
    public PurchaseResponseDto purchase(ProductPaymentRequestDto req) {
        // 요청 검증: 필수 값 체크
        if (req == null) {
            throw new IllegalArgumentException("요청 정보가 없습니다.");
        }
        if (req.userId() == null || req.userId().isBlank()) {
            throw new IllegalArgumentException("userId는 필수입니다.");
        }
        if (req.prodId() == null) {
            throw new IllegalArgumentException("prodId는 필수입니다.");
        }

        // 사용자, 상품 검증
        User user = userRepository.findByUserId(req.userId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        var prod = passProductRepository.findById(req.prodId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        // 결제 생성 (즉시 완료 상태로 처리)
        String ordNo = "ORD-" + UUID.randomUUID();

        Payment p = Payment.builder()
                .ordNo(ordNo)
                .user(user)
                .payTypeCd(req.payTypeCd())
                .payAmt(prod.getProdAmt())
                .payMethod(req.payMethod())
                // targetId/targetName은 PAYMENT 테이블에서 NOT NULL 제약이 있으므로 반드시 설정
                .targetId(prod.getProdId())
                .targetName(prod.getProdNm())
                .sttsCd(PaymentSttsCd.PAID)
                .build();

        p = paymentRepository.save(p);

        // 이용권 지급: 같은 사용자+종목의 기존 이용권 확인
        Long sportId = prod.getSport().getSportId();
        UserPass userPass = userPassRepository.findByUser_UserIdAndSportType_SportId(user.getUserId(), sportId)
                .orElse(null);

        if (userPass == null) {
            // 새 이용권 생성
            UserPass np = new UserPass();
            np.setUser(user);
            np.setSportType(prod.getSport());
            np.setPassStatusCd(PassStatusCd.ACTIVE);
            np.setRmnCnt(prod.getPrvCnt());
            // initCnt는 Integer 타입이므로 Integer로 할당
            np.setInitCnt(prod.getPrvCnt());
            np.setLstProdId(prod.getProdId());
            userPass = userPassRepository.save(np);

            // 로그
            PassLog log = PassLog.builder()
                    .userPass(userPass)
                    .chgTypeCd(PassLogChgTypeCd.BUY)
                    .chgCnt(prod.getPrvCnt())
                    .chgRsn("구매에 의한 추가")
                    .regDt(LocalDateTime.now())
                    .build();
            passLogRepository.save(log);
        } else {
            // 기존 이용권의 잔여 횟수 증가 및 lstProdId, initCnt 누적 업데이트
            int addCnt = prod.getPrvCnt();
            // rmnCnt 증가
            Integer cur = userPass.getRmnCnt();
            if (cur == null) cur = 0;
            userPass.setRmnCnt(cur + addCnt);

            // initCnt 누적: 기존 initCnt 값이 null이면 0으로 간주
            Integer prevInit = userPass.getInitCnt() != null ? userPass.getInitCnt() : 0;
            Integer newInit = prevInit + addCnt;
            userPass.setInitCnt(newInit);

            userPass.setLstProdId(prod.getProdId());
            // 상태 가능으로 설정
            userPass.setPassStatusCd(PassStatusCd.ACTIVE);
            userPass = userPassRepository.save(userPass);

            PassLog log = PassLog.builder()
                    .userPass(userPass)
                    .chgTypeCd(PassLogChgTypeCd.BUY)
                    .chgCnt(addCnt)
                    .chgRsn("구매에 의한 추가")
                    .regDt(LocalDateTime.now())
                    .build();
            passLogRepository.save(log);
        }

        return new PurchaseResponseDto(
                p.getPayId(),
                p.getOrdNo(),
                p.getSttsCd(),
                p.getPayAmt(),
                userPass.getUserPassId()
        );
    }
}
