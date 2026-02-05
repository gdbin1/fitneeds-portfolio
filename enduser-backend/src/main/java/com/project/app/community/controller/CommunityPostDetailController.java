package com.project.app.community.controller;

import com.project.app.community.dto.CommunityCommentDto;
import com.project.app.community.dto.CommunityPostDto;
import com.project.app.community.service.CommunityPostDetailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/community")
public class CommunityPostDetailController {

    private final CommunityPostDetailService service;

    public CommunityPostDetailController(CommunityPostDetailService service) {
        this.service = service;
    }

    /**
     * 게시글 상세 조회 (USER)
     */
    @GetMapping("/{postId}")
    public CommunityPostDto getPostDetail(
            @PathVariable("postId") Long postId,
            @RequestParam(value = "userId", required = false) String userId
    ) {
        return service.getVisiblePostDetail(postId, userId);
    }

    /**
     * 댓글 목록 조회 (USER)
     */
    @GetMapping("/{postId}/comments")
    public List<CommunityCommentDto> getComments(
            @PathVariable("postId") Long postId
    ) {
        return service.getVisibleCommentsByPostId(postId);
    }

    /**
     * 댓글 작성 (USER)
     */
    @PostMapping("/{postId}/comments")
    public ResponseEntity<Void> createComment(
            @PathVariable("postId") Long postId,
            @RequestBody CommunityCommentDto commentDto
    ) {
        commentDto.setWriterType("USER");
        service.createComment(postId, commentDto);
        return ResponseEntity.ok().build();
    }
}
