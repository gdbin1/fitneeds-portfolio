package com.project.app.community.controller;

import com.project.app.community.dto.CommunityCommentDto;
import com.project.app.community.service.AdminCommunityCommentService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/community/comments")
public class AdminCommunityCommentController {

    private final AdminCommunityCommentService service;

    public AdminCommunityCommentController(AdminCommunityCommentService service) {
        this.service = service;
    }

    @GetMapping("/{postId}")
    public Map<String, Object> getCommentsByPostId(
            @PathVariable("postId") Long postId,
            @RequestParam(name = "page", defaultValue = "1") int page
    ) {
        List<CommunityCommentDto> list =
                service.getCommentsByPostId(postId, page);

        int totalCount =
                service.getCommentCountByPostId(postId);

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("page", page);
        result.put("pageSize", 10);
        result.put("totalCount", totalCount);

        return result;
    }

    @PutMapping("/{commentId}/visible")
    public void updateCommentVisible(
            @PathVariable("commentId") Long commentId,
            @RequestParam("commentVisible") Integer commentVisible
    ) {
        service.updateCommentVisible(commentId, commentVisible);
    }

    @DeleteMapping("/{commentId}")
    public void deleteComment(
            @PathVariable("commentId") Long commentId
    ) {
        service.deleteComment(commentId);
    }
}
