package com.project.app.market.controller;

import com.project.app.config.security.SecurityHelper;
import com.project.app.market.dto.*;
import com.project.app.market.service.AdminMarketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@Tag(name = "[관리자] 이용권 장터 관리", description = "이용권 거래 게시글 및 거래 내역 관리 API")
@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class AdminMarketController {

    private final AdminMarketService adminMarketService;
    private final SecurityHelper securityHelper;

    // --- Post (게시글) ---

    @Operation(summary = "게시글 목록 조회", description = "검색 조건에 따라 게시글 목록을 조회합니다.")
    @GetMapping("/posts")
    public ResponseEntity<List<PostResponse>> getTradePosts(
            @Valid PostSearchRequest request
    ) {
        List<PostResponse> list = adminMarketService.getTradePostList(request);
        return ResponseEntity.ok(list);
    }

    @Operation(summary = "게시글 상세 조회", description = "특정 게시글의 상세 정보를 조회합니다.")
    @GetMapping("/posts/{id}")
    public ResponseEntity<PostResponse> getTradePost(@PathVariable Long id) {
        PostResponse response = adminMarketService.getTradePostDetail(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "게시글 수정", description = "게시글 정보를 수정합니다.")
    @PatchMapping("/posts/{id}")
    public ResponseEntity<String> updateTradePost(
            @PathVariable Long id,
            @RequestBody PostUpdateRequest request
    ) {
        adminMarketService.updateTradePost(id, request);
        return ResponseEntity.ok("게시글이 수정되었습니다.");
    }

    @Operation(summary = "게시글 상태 변경", description = "게시글 상태를 변경합니다.")
    @PatchMapping("/posts/{id}/status")
    public ResponseEntity<String> updateTradePostStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        adminMarketService.updateTradePostStatus(id, status);
        return ResponseEntity.ok("게시글 상태가 변경되었습니다.");
    }

    @Operation(summary = "게시글 삭제", description = "게시글을 삭제합니다.")
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<String> deleteTradePost(@PathVariable Long id) {
        adminMarketService.deleteTradePost(id);
        return ResponseEntity.ok("게시글이 삭제되었습니다.");
    }

    // --- Trade (거래 내역) ---

    @Operation(summary = "거래 내역 목록 조회", description = "검색 조건에 따라 거래 내역 목록을 조회합니다.")
    @GetMapping("/trades")
    public ResponseEntity<List<TradeResponse>> getTrades(
            @Valid TradeSearchRequest request
    ) {
        List<TradeResponse> list = adminMarketService.getTradeList(request);
        return ResponseEntity.ok(list);
    }

    @Operation(summary = "거래 내역 상세 조회", description = "특정 거래의 상세 정보를 조회합니다.")
    @GetMapping("/trades/{id}")
    public ResponseEntity<TradeResponse> getTrade(@PathVariable Long id) {
        TradeResponse response = adminMarketService.getTradeDetail(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "거래 상태 변경", description = "거래 상태를 변경합니다. (거래 완료/취소 처리)")
    @PatchMapping("/trades/{id}/status")
    public ResponseEntity<String> updateTradeStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        String adminId = securityHelper.getCurrentAdminUserId();
        adminMarketService.updateTradeStatus(id, status, adminId);
        return ResponseEntity.ok("거래 상태가 변경되었습니다.");
    }
}
