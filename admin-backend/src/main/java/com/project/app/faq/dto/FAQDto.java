package com.project.app.faq.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FAQDto {

    private Long postId;
    private String postType;      // FAQ
    private String category;
    
    private String title;         // 질문
    private String content;       // 답변

    private String writerId;
    private String writerType;

    private Long branchId;

    private Boolean isVisible;    // 사용자 노출 여부
    private Boolean postVisible;  // 관리자 숨김/보이기(논리삭제 포함)

    private LocalDateTime displayStart;
    private LocalDateTime displayEnd;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
