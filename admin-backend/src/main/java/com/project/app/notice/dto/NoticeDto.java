package com.project.app.notice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoticeDto {

    private Long postId;
    private String postType;     // NOTICE

    private String title;
    private String content;

    private String writerId;       // STAFF.STAFF_ID (BIGINT)
    private String writerType;   // STAFF

    // 🔽 JOIN 결과용 (출력 전용)
    private String writerName;   // STAFF.STAFF_NM
    private String branchName;   // BRANCH.BRCH_NM

    private Long branchId;
    private Integer views;

    private Boolean isVisible;   // 공지사항 숨김/보이기
    private Boolean isPinned;

    /**
     * 🔥 공지 종료 날짜
     * - NULL  : 상시 공지
     * - 값 있음: 해당 날짜 이후 자동 숨김 대상
     */
    private LocalDateTime displayEnd;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
