package com.project.app.market.repository;

import com.project.app.market.entity.PassTradeTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarketTradeRepository extends JpaRepository<PassTradeTransaction, Long> {

    /**
     * 특정 게시물의 거래 목록 조회
     */
    List<PassTradeTransaction> findByPost_PostId(Long postId);

    /**
     * 특정 구매자의 거래 목록 조회
     */
    List<PassTradeTransaction> findByBuyerUser_UserId(String buyerId);

    /**
     * 특정 상태의 거래 목록 조회
     */
    List<PassTradeTransaction> findBySttsCd(String statusCode);

    /**
     * 거래 ID와 상태로 거래 조회
     */
    Optional<PassTradeTransaction> findByTradeIdAndSttsCd(Long tradeId, String statusCode);
}

