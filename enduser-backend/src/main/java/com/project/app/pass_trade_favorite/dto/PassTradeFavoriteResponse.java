package com.project.app.pass_trade_favorite.dto;

import lombok.Data;

import java.time.LocalDateTime;

// 즐겨찾기 응답 DTO
// 즐겨찾기 정보를 클라이언트에 전송하는 데이터
// 즐겨찾기 목록 및 상태 확인에서 사용
@Data
public class PassTradeFavoriteResponse {
    
    // 즐겨찾기 ID
    private Long favoriteId;
    
    // 사용자 ID
    private String userId;
    
    // 게시글 ID
    private Long postId;
    
    // 즐겨찾기 여부
    private boolean isFavorite;
    
    // 등록일시
    private LocalDateTime regDt;
}