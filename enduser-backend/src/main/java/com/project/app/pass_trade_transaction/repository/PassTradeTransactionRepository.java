package com.project.app.pass_trade_transaction.repository;
import com.project.app.pass_trade_transaction.dto.response.PassTradeTransactionListResponse;
import com.project.app.pass_trade_transaction.entity.PassTradeTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PassTradeTransactionRepository
        extends JpaRepository<PassTradeTransaction, Long> {

    // ✅ 판매 내역 (판매자 기준)
    @Query("""
    select new com.project.app.pass_trade_transaction.dto.response.PassTradeTransactionListResponse(
        t.transactionId,
        p.postId,
        coalesce(p.title, concat(st.sportNm, ' 이용권')),
        b.userId,
        b.userName,
        s.userId,
        s.userName,
        t.buyQty,
        t.tradeAmt,
        t.sttsCd,
        t.regDt
    )
    from PassTradeTransaction t
    join PassTradePost p on t.postId = p.postId
    join p.sportType st
    join User b on t.buyerId = b.userId
    join User s on p.sellerId = s.userId
    where p.sellerId = :sellerId
    order by t.regDt desc
    """)
    List<PassTradeTransactionListResponse> findSellTransactionList(
            @Param("sellerId") String sellerId
    );

    // ✅ 구매 내역 (구매자 기준)
    @Query("""
    select new com.project.app.pass_trade_transaction.dto.response.PassTradeTransactionListResponse(
        t.transactionId,
        p.postId,
        coalesce(p.title, concat(st.sportNm, ' 이용권')),
        b.userId,
        b.userName,
        s.userId,
        s.userName,
        t.buyQty,
        t.tradeAmt,
        t.sttsCd,
        t.regDt
    )
    from PassTradeTransaction t
    join PassTradePost p on t.postId = p.postId
    join p.sportType st
    join User b on t.buyerId = b.userId
    join User s on p.sellerId = s.userId
    where t.buyerId = :buyerId
    order by t.regDt desc
    """)
    List<PassTradeTransactionListResponse> findBuyTransactionList(
            @Param("buyerId") String buyerId
    );
}
