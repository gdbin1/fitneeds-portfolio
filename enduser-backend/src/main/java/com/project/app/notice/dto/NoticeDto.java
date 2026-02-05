package com.project.app.notice.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class NoticeDto {

    private Long postId;
    private String title;
    private String content;
    private Integer views;

    private LocalDateTime displayEnd;   // 공지 종료 날짜
    private LocalDateTime createdAt;
    
    private Boolean isPinned;

    
    // ✅ 지점명 (branch JOIN 결과)
    private String branchName;
}
