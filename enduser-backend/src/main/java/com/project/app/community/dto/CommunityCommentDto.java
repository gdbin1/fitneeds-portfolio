package com.project.app.community.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class CommunityCommentDto {

    private Long commentId;
    private Long postId;
    private String writerId;
    private String writerType;
    private String content;
    private LocalDateTime createdAt;
    
    /** 🔥 작성자 이름 (JOIN 결과, 출력용) */
    private String writerName;
}
