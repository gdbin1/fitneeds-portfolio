package com.project.app.faq.controller;

import com.project.app.faq.dto.FAQDto;
import com.project.app.faq.service.AdminFAQService;
import com.project.app.faq.service.AdminFAQService.PagedResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/faq")
public class AdminFAQController {

    private final AdminFAQService adminFAQService;

    public AdminFAQController(AdminFAQService adminFAQService) {
        this.adminFAQService = adminFAQService;
    }

    /**
     * =========================
     * ADMIN FAQ 목록 조회 (페이징)
     * - GET /api/admin/faq?keyword=&visible=&page=
     * =========================
     */
    @GetMapping
    public PagedResult<FAQDto> getFAQListPaged(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "visible", required = false) Boolean visible,
            @RequestParam(value = "page", defaultValue = "1") int page
    ) {
        return adminFAQService.getFAQListPaged(keyword, visible, page);
    }

    /**
     * =========================
     * ADMIN FAQ 상세 조회
     * =========================
     */
    @GetMapping("/{postId}")
    public FAQDto getFAQDetail(@PathVariable("postId") Long postId) {
        return adminFAQService.getFAQDetail(postId);
    }

    /**
     * =========================
     * ADMIN FAQ 등록
     * =========================
     */
    @PostMapping
    public FAQDto createFAQ(@RequestBody FAQDto dto) {
        Long postId = adminFAQService.createFAQ(dto);
        dto.setPostId(postId);
        return dto;
    }

    /**
     * =========================
     * ADMIN FAQ 수정
     * =========================
     */
    @PutMapping("/{postId}")
    public void updateFAQ(
            @PathVariable("postId") Long postId,
            @RequestBody FAQDto dto
    ) {
        dto.setPostId(postId);
        adminFAQService.updateFAQ(dto);
    }

    /**
     * =========================
     * ADMIN FAQ 노출 여부 변경 (is_visible)
     * =========================
     */
    @PutMapping("/{postId}/visible")
    public void updateFAQVisible(
            @PathVariable("postId") Long postId,
            @RequestParam("visible") boolean visible
    ) {
        adminFAQService.updateFAQVisible(postId, visible);
    }


    /**
     * =========================
     * ADMIN FAQ 삭제 (논리 삭제: post_visible = 0)
     * =========================
     */
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deleteFAQ(@PathVariable("postId") Long postId) {
        adminFAQService.deleteFAQ(postId);
        return ResponseEntity.ok().build();
    }
}
