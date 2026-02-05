package com.project.app.pass_trade.controller;

import com.project.app.pass_trade.service.PassTradeCompleteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "이용권 거래 완료 API")
@RestController
@RequestMapping("/api/pass-trade")
@RequiredArgsConstructor
public class PassTradeCompleteController {

    private final PassTradeCompleteService completeService;

    @Operation(summary = "이용권 거래 구매 완료")
    @PostMapping("/{postId}/complete")
    public ResponseEntity<Void> completeTrade(
            @PathVariable Long postId,
            @RequestParam int buyCount,
            Authentication authentication
    ) {
        // ✅ JWT에서 로그인 사용자 ID 추출
        String buyerId = authentication.getName();

        completeService.completeTrade(postId, buyerId, buyCount);
        return ResponseEntity.ok().build();
    }
}
