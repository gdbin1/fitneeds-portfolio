package com.project.app.notice.controller;

import com.project.app.notice.dto.NoticeDto;
import com.project.app.notice.service.AdminNoticeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/notice")
public class AdminNoticeController {

    private final AdminNoticeService adminNoticeService;

    public AdminNoticeController(AdminNoticeService adminNoticeService) {
        this.adminNoticeService = adminNoticeService;
    }

    /**
     * ADMIN 공지사항 목록 조회
     */
    @GetMapping
    public List<NoticeDto> getNoticeList() {
        return adminNoticeService.getNoticeList();
    }

    /**
     * ADMIN 공지사항 상세 조회
     */
    @GetMapping("/{postId}")
    public NoticeDto getNoticeDetail(
            @PathVariable("postId") Long postId
    ) {
        return adminNoticeService.getNoticeDetail(postId);
    }

    /**
     * ADMIN 공지사항 등록
     * - DB에서 생성된 postId를 그대로 반환
     */
    @PostMapping
    public NoticeDto createNotice(@RequestBody NoticeDto dto) {
        adminNoticeService.createNotice(dto);
        return dto; // ⭐ useGeneratedKeys로 postId 세팅됨
    }

    /**
     * ADMIN 공지사항 수정
     */
    @PutMapping("/{postId}")
    public void updateNotice(
            @PathVariable("postId") Long postId,
            @RequestBody NoticeDto dto
    ) {
        dto.setPostId(postId);
        adminNoticeService.updateNotice(dto);
    }

    /**
     * ADMIN 공지사항 숨김 / 보이기
     * - is_visible 컬럼만 사용
     */
    @PutMapping("/{postId}/visible")
    public void updateVisible(
            @PathVariable("postId") Long postId,
            @RequestParam("visible") boolean visible
    ) {
        adminNoticeService.updateVisible(postId, visible);
    }

    /**
     * 🔥 ADMIN 공지사항 상단 고정 / 해제
     */
    @PutMapping("/{postId}/pin")
    public void updatePinned(
            @PathVariable("postId") Long postId,
            @RequestParam("pinned") boolean pinned
    ) {
        adminNoticeService.updatePinned(postId, pinned);
    }
    
    
    /**
     * ADMIN 공지사항 삭제 (논리 삭제)
     * - is_visible = false 처리
     */
    @DeleteMapping("/{postId}")
    public void deleteNotice(
            @PathVariable("postId") Long postId
    ) {
        adminNoticeService.deleteNotice(postId);
    }
}
