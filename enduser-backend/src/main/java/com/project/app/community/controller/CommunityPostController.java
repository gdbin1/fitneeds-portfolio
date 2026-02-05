package com.project.app.community.controller;

import com.project.app.community.dto.CommunityPostDto;
import com.project.app.community.service.CommunityPostService;
import com.project.app.community.service.CommunityPostService.PagedResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/community")
public class CommunityPostController {

    private final CommunityPostService communityPostService;

    public CommunityPostController(CommunityPostService communityPostService) {
        this.communityPostService = communityPostService;
    }

    /**
     * =========================
     * USER 커뮤니티 글 작성
     * =========================
     */
    @PostMapping
    public ResponseEntity<Void> createCommunityPost(
            @RequestBody CommunityPostDto communityPostDto
    ) {
        // ⚠️ 로그인 연동 전 임시 처리
        if (communityPostDto.getWriterId() == null) {
            communityPostDto.setWriterId("1"); // 추후 로그인 사용자 ID로 교체
        }

        communityPostService.createCommunityPost(communityPostDto);
        return ResponseEntity.ok().build();
    }

    /**
     * =========================
     * USER 커뮤니티 글 목록 조회 (🔥 페이징)
     *
     * GET /api/user/community?page=1
     * =========================
     */
    @GetMapping
    public ResponseEntity<PagedResult<CommunityPostDto>> getCommunityPostList(
            @RequestParam(value = "page", defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(
                communityPostService.getVisibleCommunityPostListPaged(page)
        );
    }

    /**
     * =========================
     * 🔥 내가 쓴 글 목록 조회 (USER)
     *
     * GET /api/user/community/my-posts?userId=UUID
     * =========================
     */
    @GetMapping("/my-posts")
    public ResponseEntity<List<CommunityPostDto>> getMyCommunityPostList(
            @RequestParam("userId") String userId
    ) {
        return ResponseEntity.ok(
                communityPostService.getMyCommunityPostList(userId)
        );
    }

    /**
     * =========================
     * ✏️ 내가 쓴 글 수정 (본인만)
     *
     * PUT /api/user/community/{postId}?userId=UUID
     * =========================
     */
    @PutMapping("/{postId}")
    public ResponseEntity<Void> updateCommunityPost(
            @PathVariable("postId") Long postId,
            @RequestParam("userId") String userId,
            @RequestBody CommunityPostDto dto
    ) {
        communityPostService.updateCommunityPost(postId, userId, dto);
        return ResponseEntity.ok().build();
    }

    /**
     * =========================
     * 🗑 내가 쓴 글 삭제 (본인만, 소프트 삭제)
     *
     * DELETE /api/user/community/{postId}?userId=UUID
     * =========================
     */
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deleteCommunityPost(
            @PathVariable("postId") Long postId,
            @RequestParam("userId") String userId
    ) {
        communityPostService.deleteCommunityPost(postId, userId);
        return ResponseEntity.ok().build();
    }
}
