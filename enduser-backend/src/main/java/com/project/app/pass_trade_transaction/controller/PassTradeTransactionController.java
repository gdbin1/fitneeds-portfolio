package com.project.app.pass_trade_transaction.controller;

import com.project.app.pass_trade_transaction.dto.response.PassTradeTransactionListResponse;

import com.project.app.pass_trade_transaction.service.PassTradeTransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "이용권 거래 내역 조회 API",
        description = "이용권 거래 완료(구매/판매) 내역 조회 API"
)
@RestController
@RequestMapping("/api/pass-trade-transactions")
@RequiredArgsConstructor
public class PassTradeTransactionController {

    private final PassTradeTransactionService transactionService;

    /**
     * ✅ 내가 판매한 거래 내역
     * - sellerId는 무조건 authentication.getName()
     */
    @Operation(summary = "판매 거래 내역 조회")
    @GetMapping("/sell")
    public ResponseEntity<List<PassTradeTransactionListResponse>> getSellTransactions(
            Authentication authentication
    ) {
        String sellerId = authentication.getName();
        return ResponseEntity.ok(
                transactionService.getSellTransactions(sellerId)
        );
    }

    /**
     * ✅ 내가 구매한 거래 내역
     * - buyerId는 무조건 authentication.getName()
     */
    @Operation(summary = "구매 거래 내역 조회")
    @GetMapping("/buy")
    public ResponseEntity<List<PassTradeTransactionListResponse>> getBuyTransactions(
            Authentication authentication
    ) {
        String buyerId = authentication.getName();
        return ResponseEntity.ok(
                transactionService.getBuyTransactions(buyerId)
        );
    }
}
