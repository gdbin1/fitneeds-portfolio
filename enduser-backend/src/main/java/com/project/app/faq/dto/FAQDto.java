package com.project.app.faq.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class FAQDto {

    /** 게시글 ID */
    private Long postId;

    /** 게시글 타입 (FAQ) */
    private String postType;

    /** FAQ 카테고리 (이용안내 / 결제/환불 / 시설이용 / 기타) */
    private String category;

    /** 질문 */
    private String title;

    /** 답변 */
    private String content;

    /** 노출 여부 */
    private Boolean isVisible;

    /** 등록일 */
    private LocalDateTime createdAt;
}
