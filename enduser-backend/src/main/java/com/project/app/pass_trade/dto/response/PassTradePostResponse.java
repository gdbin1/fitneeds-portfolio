package com.project.app.pass_trade.dto.response;

import com.project.app.pass_trade.entity.TradeStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 거래 게시글 응답 DTO
 *
 * ✔ 거래 게시글 정보를 클라이언트에 전달하기 위한 전용 DTO
 * ✔ Entity 직접 노출 방지
 * ✔ 즐겨찾기 상태(isFavorite)를 포함하여
 *   메인 목록과 즐겨찾기 UI를 동시에 지원
 *
 * [설계 포인트]
 * - saleAmount(총 판매 금액) 기준 사용
 * - pricePerUnit 필드는 제거된 상태 유지
 * - isFavorite는 "응답 전용 계산 필드"
 */
@Data
public class PassTradePostResponse {

    /* =========================
       기본 거래 게시글 정보
       ========================= */

    // 게시글 ID
    private Long postId;

    // 판매자 사용자 ID
    private String sellerId;

    // 판매 대상 이용권 ID
    private Long userPassId;

    // 판매 수량
    private Integer sellCount;

    // 전체 판매 금액 (단가 * 수량)
    private BigDecimal saleAmount;

    // 게시글 제목
    private String title;

    // 게시글 내용
    private String content;

    // 거래 상태 (SELLING, SOLD, CANCELED)
    private TradeStatus tradeStatus;

    // 게시글 등록일시
    private LocalDateTime regDt;

    // 게시글 수정일시
    private LocalDateTime updDt;

    /* =========================
       화면 표시용 부가 정보
       ========================= */

    // 종목명 (ex. 헬스, 요가 등)
    private String sportNm;

    // 판매자 이름
    private String sellerName;

    /* =========================
       즐겨찾기 관련 정보
       ========================= */

    /**
     * 현재 로그인 사용자의 즐겨찾기 여부
     *
     * - true  : 즐겨찾기 상태
     * - false : 즐겨찾기 아님
     *
     * [중요]
     * - DB 컬럼 ❌
     * - 요청 시점에 계산되어 내려가는 응답 전용 필드
     * - 메인 목록 / 즐겨찾기 UI 공통 사용
     */
    private boolean isFavorite;
}
