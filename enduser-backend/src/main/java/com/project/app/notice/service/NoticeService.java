package com.project.app.notice.service;

import com.project.app.notice.dto.NoticeDto;
import com.project.app.notice.mapper.NoticeMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NoticeService {

    private final NoticeMapper noticeMapper;

    public NoticeService(NoticeMapper noticeMapper) {
        this.noticeMapper = noticeMapper;
    }

    /**
     * USER 공지 목록 조회
     * - post_type = NOTICE
     * - is_visible = true
     * - 최신순
     */
    public List<NoticeDto> getNoticeList() {
        return noticeMapper.selectNoticeList();
    }

    /**
     * USER 공지 상세 조회
     * - is_visible = true 만 조회
     * - 조회수 증가
     */
    @Transactional
    public NoticeDto getNoticeDetail(Long postId) {

        // 조회수 증가
        int updated = noticeMapper.increaseViews(postId);
        if (updated == 0) {
            throw new IllegalArgumentException("존재하지 않거나 숨김 처리된 공지입니다.");
        }

        // 상세 조회
        NoticeDto notice = noticeMapper.selectNoticeDetail(postId);
        if (notice == null) {
            throw new IllegalArgumentException("존재하지 않거나 숨김 처리된 공지입니다.");
        }

        return notice;
    }
}
