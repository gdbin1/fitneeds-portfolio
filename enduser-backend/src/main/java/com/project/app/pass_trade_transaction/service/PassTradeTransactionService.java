package com.project.app.pass_trade_transaction.service;

import com.project.app.pass_trade_transaction.dto.response.PassTradeTransactionListResponse;
import com.project.app.pass_trade_transaction.repository.PassTradeTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PassTradeTransactionService {

    private final PassTradeTransactionRepository transactionRepository;

    /**
     * ✅ 내가 판매한 거래 내역 조회
     * - 판매자 기준
     * - 게시글 제목 / 구매자 이름 / 판매자 이름 포함 DTO 반환
     */
    @Transactional(readOnly = true)
    public List<PassTradeTransactionListResponse> getSellTransactions(String sellerId) {
        return transactionRepository.findSellTransactionList(sellerId);
    }

    /**
     * ✅ 내가 구매한 거래 내역 조회
     * - 구매자 기준
     * - 게시글 제목 / 구매자 이름 / 판매자 이름 포함 DTO 반환
     */
    @Transactional(readOnly = true)
    public List<PassTradeTransactionListResponse> getBuyTransactions(String buyerId) {
        return transactionRepository.findBuyTransactionList(buyerId);
    }
}
