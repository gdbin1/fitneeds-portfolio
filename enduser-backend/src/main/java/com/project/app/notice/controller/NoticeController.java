package com.project.app.notice.controller;

import com.project.app.notice.dto.NoticeDto;
import com.project.app.notice.service.NoticeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/notice")
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    /**
     * USER 공지 목록 조회
     * - post_type = NOTICE
     * - is_visible = true
     * - 최신순
     */
    @GetMapping
    public ResponseEntity<List<NoticeDto>> getNoticeList() {
        List<NoticeDto> list = noticeService.getNoticeList();
        return ResponseEntity.ok(list);
    }

    /**
     * USER 공지 상세 조회
     * - is_visible = true 만 조회
     * - 조회수 증가
     */
    @GetMapping("/{postId}")
    public ResponseEntity<NoticeDto> getNoticeDetail(
            @PathVariable("postId") Long postId
    ) {
        NoticeDto notice = noticeService.getNoticeDetail(postId);
        return ResponseEntity.ok(notice);
    }

}
