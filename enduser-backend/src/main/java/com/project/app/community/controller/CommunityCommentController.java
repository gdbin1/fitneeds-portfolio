package com.project.app.community.controller;

import com.project.app.community.dto.CommunityCommentDto;
import com.project.app.community.service.CommunityCommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community/comments")
public class CommunityCommentController {

    private final CommunityCommentService communityCommentService;

    public CommunityCommentController(CommunityCommentService communityCommentService) {
        this.communityCommentService = communityCommentService;
    }

    /**
     * =========================
     * USER 댓글 목록 조회
     * =========================
     *
     * GET /api/community/comments/{postId}
     */
    @GetMapping("/{postId}")
    public List<CommunityCommentDto> getVisibleComments(
            @PathVariable("postId") Long postId
    ) {
        return communityCommentService.getVisibleCommentsByPostId(postId);
    }

    /**
     * =========================
     * ✏️ 댓글 수정 (본인만)
     * =========================
     *
     * PUT /api/community/comments/{commentId}
     *
     * Request Body:
     * {
     *   "userId": "UUID",
     *   "content": "수정된 댓글 내용"
     * }
     */
    @PutMapping("/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable("commentId") Long commentId,
            @RequestBody Map<String, String> body
    ) {
        String userId = body.get("userId");
        String content = body.get("content");

        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().body("userId는 필수입니다.");
        }

        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body("댓글 내용은 필수입니다.");
        }

        try {
            communityCommentService.updateComment(commentId, userId, content);
            return ResponseEntity.ok("댓글이 수정되었습니다.");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * =========================
     * 🗑 댓글 삭제 (본인만)
     * =========================
     *
     * DELETE /api/community/comments/{commentId}
     *
     * Request Body:
     * {
     *   "userId": "UUID"
     * }
     */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable("commentId") Long commentId,
            @RequestBody Map<String, String> body
    ) {
        String userId = body.get("userId");

        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().body("userId는 필수입니다.");
        }

        try {
            communityCommentService.deleteComment(commentId, userId);
            return ResponseEntity.ok("댓글이 삭제되었습니다.");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
