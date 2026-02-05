package com.project.app.community.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommunityCommentDto {

    private Long commentId;
    private Long postId;

    /**
     * 작성자 식별자
     * - USER  : userId (UUID)
     * - STAFF : staffId
     */
//    private String writerId;
    private String writerEmail;

    /**
     * 작성자 타입
     * - USER
     * - STAFF
     */
    private String writerType;

    private String content;
    private LocalDateTime createdAt;

    /**
	 * 댓글 노출 여부 1 : 노출 0 : 숨김
	 */
	private Integer commentVisible;
}
