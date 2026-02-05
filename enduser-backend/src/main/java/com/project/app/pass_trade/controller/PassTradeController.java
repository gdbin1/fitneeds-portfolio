package com.project.app.pass_trade.controller;

import com.project.app.pass_trade.dto.request.PassTradeBuyRequest;
import com.project.app.pass_trade.dto.request.PassTradePostCreateRequest;

import com.project.app.pass_trade.dto.request.PassTradePostUpdateRequest;

import com.project.app.pass_trade.dto.response.PassTradePostResponse;
import com.project.app.pass_trade.service.PassTradeService;
import com.project.app.pass_trade_favorite.dto.PassTradeFavoriteResponse;
import com.project.app.pass_trade_favorite.service.PassTradeFavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import java.util.List;

@Tag(name = "이용권 거래 API", description = "이용권 거래 게시글 등록/조회/즉시 구매")
@RestController
@RequestMapping("/api/pass-trade")
@RequiredArgsConstructor
public class PassTradeController {

    private final PassTradeService passTradeService;
    private final PassTradeFavoriteService favoriteService;

    // 거래 게시글 등록
    @Operation(summary = "거래 게시글 등록", description = "이용권 판매를 위한 거래 게시글을 등록합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "거래 게시글 등록 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    @PostMapping("/posts")
    public ResponseEntity<PassTradePostResponse> createTradePost(
            Authentication authentication,
            @RequestBody PassTradePostCreateRequest request) {

        String sellerId = authentication.getName(); // JWT subject (userId)

        PassTradePostResponse response =
                passTradeService.createTradePost(sellerId, request);

        return ResponseEntity.ok(response);
    }



    // 활성 거래 게시글 목록 조회
    @Operation(summary = "거래 게시글 목록 조회", description = "판매 중인 이용권 거래 게시글 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "거래 게시글 목록 조회 성공")
    })
    @GetMapping("/posts")
    public ResponseEntity<List<PassTradePostResponse>> getTradePosts() {
        return ResponseEntity.ok(passTradeService.getActiveTradePosts());
    }

    // 즉시 구매
    @Operation(summary = "이용권 즉시 구매", description = "게시된 이용권을 즉시 구매하여 거래를 완료합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "거래 완료"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    @PostMapping("/posts/{postId}/buy")
    public ResponseEntity<Void> buyTrade(
            @PathVariable Long postId,
            @RequestParam String buyerId,
            @RequestBody PassTradeBuyRequest request) {


                passTradeService.buyTrade(postId, buyerId, request);

        return ResponseEntity.ok().build();
    }


    // 본인 거래 게시글 삭제
    @Operation(
            summary = "본인 거래 게시글 삭제",
            description = "판매 중인 본인의 거래 게시글을 삭제(soft delete)합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "게시글 삭제 성공"),
            @ApiResponse(responseCode = "400", description = "삭제 불가 상태"),
            @ApiResponse(responseCode = "404", description = "게시글 없음")
    })
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deleteMyTradePost(
            @PathVariable Long postId,
            @RequestParam String sellerId
    ) {
        passTradeService.deleteMyPost(postId, sellerId);
        return ResponseEntity.noContent().build();
    }

    // 본인 거래 게시글 수정
    @Operation(
            summary = "본인 거래 게시글 수정",
            description = "판매 중인 본인의 거래 게시글 내용을 수정합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "게시글 수정 성공"),
            @ApiResponse(responseCode = "400", description = "수정 불가 상태"),
            @ApiResponse(responseCode = "404", description = "게시글 없음")
    })
    @PutMapping("/posts/{postId}")
    public ResponseEntity<PassTradePostResponse> updateMyTradePost(
            @PathVariable Long postId,
            @RequestParam String sellerId,
            @RequestBody PassTradePostUpdateRequest request
    ) {
        PassTradePostResponse response =
                passTradeService.updateMyPost(postId, sellerId, request);

        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "이용권 거래 게시물 즐겨찾기 토글",
            description = """
        이용권 거래 게시물의 즐겨찾기 상태를 토글한다.

        - 이미 즐겨찾기된 게시물 → 즐겨찾기 해제
        - 즐겨찾기되지 않은 게시물 → 즐겨찾기 추가

        ※ 컨트롤러 분리 구조 유지:
        외부 API는 PassTradeController에서 제공하며,
        내부적으로 FavoriteService로 위임 처리한다.
        """
    )
    @PatchMapping("/posts/{postId}/favorite")
    public ResponseEntity<Void> toggleFavorite(
            @PathVariable Long postId,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        passTradeService.toggleFavorite(userId, postId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/posts/favorites")
    public ResponseEntity<List<PassTradeFavoriteResponse>> getFavoritePosts(
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(
                favoriteService.getFavorites(userId)
        );
    }


}
