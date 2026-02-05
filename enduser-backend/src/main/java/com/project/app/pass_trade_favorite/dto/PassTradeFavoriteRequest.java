package com.project.app.pass_trade_favorite.dto;

import lombok.Data;

// 즐겨찾기 요청 DTO
// 즐겨찾기 추가 시 전송하는 데이터
// 대상 게시글 ID 포함
@Data
public class PassTradeFavoriteRequest {
    
    // 즐겨찾기할 게시글 ID
    private Long postId;

    private String userId;
}