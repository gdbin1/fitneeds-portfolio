package com.project.app.pass_trade_favorite.controller;

import com.project.app.pass_trade_favorite.dto.PassTradeFavoriteRequest;
import com.project.app.pass_trade_favorite.dto.PassTradeFavoriteResponse;
import com.project.app.pass_trade_favorite.service.PassTradeFavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "이용권 거래 즐겨찾기 API", description = "이용권 거래 게시글 즐겨찾기")
@RestController
@RequestMapping("/api/pass-trade-favorite")
@RequiredArgsConstructor
public class PassTradeFavoriteController {

    private final PassTradeFavoriteService favoriteService;

    /**
     * 즐겨찾기 추가
     */
    @Operation(summary = "즐겨찾기 추가", description = "거래 게시글을 즐겨찾기에 추가합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "즐겨찾기 추가 성공"),
            @ApiResponse(responseCode = "400", description = "이미 즐겨찾기된 게시글"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping
    public ResponseEntity<Void> addFavorite(
            Authentication authentication,
            @RequestBody PassTradeFavoriteRequest request
    ) {
        String userId = authentication.getName();
        favoriteService.addFavorite(userId, request.getPostId());
        return ResponseEntity.ok().build();
    }

    /**
     * 즐겨찾기 해제
     */
    @Operation(summary = "즐겨찾기 해제", description = "거래 게시글을 즐겨찾기에서 제거합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "즐겨찾기 해제 성공"),
            @ApiResponse(responseCode = "400", description = "즐겨찾기 정보 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> removeFavorite(
            Authentication authentication,
            @PathVariable Long postId
    ) {
        String userId = authentication.getName();
        favoriteService.removeFavorite(userId, postId);
        return ResponseEntity.ok().build();
    }



    // 내 즐겨찾기 목록 조회
    @Operation(summary = "즐겨찾기 목록 조회", description = "사용자의 즐겨찾기 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "즐겨찾기 목록 조회 성공"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping
    public ResponseEntity<List<PassTradeFavoriteResponse>> getFavorites(
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(favoriteService.getFavorites(userId));
    }

    /**
     * 특정 게시글 즐겨찾기 여부 확인
     */
    @Operation(summary = "즐겨찾기 여부 확인", description = "특정 게시글의 즐겨찾기 여부를 확인합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "즐겨찾기 여부 반환"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{postId}")
    public ResponseEntity<Boolean> isFavorite(
            Authentication authentication,
            @PathVariable Long postId
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(favoriteService.isFavorite(userId, postId));
    }
}
