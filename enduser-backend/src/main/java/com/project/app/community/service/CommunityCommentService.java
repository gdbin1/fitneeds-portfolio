package com.project.app.community.service;

import com.project.app.community.dto.CommunityCommentDto;
import com.project.app.community.mapper.CommunityCommentMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommunityCommentService {

    private final CommunityCommentMapper communityCommentMapper;

    public CommunityCommentService(CommunityCommentMapper communityCommentMapper) {
        this.communityCommentMapper = communityCommentMapper;
    }

    /**
     * =========================
     * USER 댓글 목록 조회
     * =========================
     *
     * - 특정 게시글(postId)에 대한 댓글
     * - 관리자에 의해 숨김 처리되지 않은 댓글만 반환
     */
    @Transactional(readOnly = true)
    public List<CommunityCommentDto> getVisibleCommentsByPostId(Long postId) {
        return communityCommentMapper.selectVisibleCommentsByPostId(postId);
    }

    /**
     * =========================
     * ✏️ 댓글 수정 (본인만)
     * =========================
     *
     * 규칙:
     * - 댓글 작성자만 수정 가능
     */
    @Transactional
    public void updateComment(Long commentId, String writerId, String content) {

        // 1️⃣ 작성자 본인 여부 체크
        int exists =
                communityCommentMapper.countByCommentIdAndWriterId(commentId, writerId);

        if (exists == 0) {
            throw new IllegalStateException("댓글 수정 권한이 없습니다.");
        }

        // 2️⃣ 댓글 수정
        communityCommentMapper.updateCommentContent(commentId, writerId, content);
    }

    /**
     * =========================
     * 🗑 댓글 삭제 (본인만)
     * =========================
     *
     * 규칙:
     * - 댓글 작성자만 삭제 가능
     */
    @Transactional
    public void deleteComment(Long commentId, String writerId) {

        // 1️⃣ 작성자 본인 여부 체크
        int exists =
                communityCommentMapper.countByCommentIdAndWriterId(commentId, writerId);

        if (exists == 0) {
            throw new IllegalStateException("댓글 삭제 권한이 없습니다.");
        }

        // 2️⃣ 댓글 삭제
        communityCommentMapper.deleteCommentByWriter(commentId, writerId);
    }
}
