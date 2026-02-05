package com.project.app.community.mapper;

import com.project.app.community.dto.CommunityCommentDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CommunityCommentMapper {

    /**
     * =========================
     * USER 댓글 목록 조회
     * =========================
     *
     * - 특정 게시글(postId)에 대한 댓글
     * - 보이는 댓글(comment_visible = 1)만 조회
     */
    List<CommunityCommentDto> selectVisibleCommentsByPostId(
            @Param("postId") Long postId
    );

    /**
     * =========================
     * 🔒 댓글 작성자 본인 여부 체크
     * =========================
     */
    int countByCommentIdAndWriterId(
            @Param("commentId") Long commentId,
            @Param("writerId") String writerId
    );

    /**
     * =========================
     * ✏️ 댓글 수정 (본인만)
     * =========================
     */
    int updateCommentContent(
            @Param("commentId") Long commentId,
            @Param("writerId") String writerId,
            @Param("content") String content
    );

    /**
     * =========================
     * 🗑 댓글 삭제 (본인만)
     * =========================
     */
    int deleteCommentByWriter(
            @Param("commentId") Long commentId,
            @Param("writerId") String writerId
    );
}
