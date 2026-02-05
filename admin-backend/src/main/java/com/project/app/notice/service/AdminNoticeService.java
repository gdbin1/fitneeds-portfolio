package com.project.app.notice.service;

import com.project.app.notice.dto.NoticeDto;
import com.project.app.notice.mapper.AdminNoticeMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminNoticeService {

    private final AdminNoticeMapper adminNoticeMapper;

    public AdminNoticeService(AdminNoticeMapper adminNoticeMapper) {
        this.adminNoticeMapper = adminNoticeMapper;
    }

    /**
     * ADMIN 공지사항 목록 조회
     * - 숨김 여부 무관
     * - 종료 날짜 지난 공지는 자동 숨김 처리 (if문)
     */
    public List<NoticeDto> getNoticeList() {

        List<NoticeDto> list = adminNoticeMapper.selectNoticeList();
        LocalDateTime now = LocalDateTime.now();

        for (NoticeDto notice : list) {
            // 🔥 종료 날짜가 있고, 현재 시간보다 과거면 자동 숨김
            if (
                notice.getDisplayEnd() != null
                && notice.getDisplayEnd().isBefore(now)
            ) {
                notice.setIsVisible(false);
            }
        }

        return list;
    }

    /**
     * ADMIN 공지사항 상세 조회
     */
    public NoticeDto getNoticeDetail(Long postId) {
        return adminNoticeMapper.selectNoticeDetail(postId);
    }

    /**
     * ADMIN 공지사항 등록
     * - displayEnd = null → 상시 공지
     * - displayEnd != null → 종료 날짜 있는 공지
     */
    @Transactional
    public void createNotice(NoticeDto dto) {

        // 고정 정책
        dto.setPostType("NOTICE");
        dto.setWriterType("STAFF");
        dto.setViews(0);
        dto.setIsVisible(true);

        // 🔥 임시 관리자 ID (권한 연동 전)
        dto.setWriterId("1");
             
        // 필수값 검증
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()
                || dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("필수값 누락 (title, content)");
        }

        // displayEnd
        // - null → 상시 공지
        // - 값 있음 → 종료 날짜 공지
        adminNoticeMapper.insertNotice(dto);
    }

    /**
     * ADMIN 공지사항 수정
     * - 종료 날짜 수정 가능
     * - null 전달 시 상시 공지로 변경
     */
    @Transactional
    public void updateNotice(NoticeDto dto) {
        dto.setPostType("NOTICE");
        
        adminNoticeMapper.updateNotice(dto);
    }

    /**
     * ADMIN 공지사항 숨김 / 보이기
     */
    @Transactional
    public void updateVisible(Long postId, boolean visible) {
        adminNoticeMapper.updateVisible(postId, visible);
    }
    
//    ADMIN 공지사항 상단 고정 / 해제
    @Transactional
    public void updatePinned(Long postId, boolean pinned) {
        adminNoticeMapper.updatePinned(postId, pinned);
    }
    
    /**
     * ADMIN 공지사항 삭제
     */
    @Transactional
    public void deleteNotice(Long postId) {
        adminNoticeMapper.deleteNotice(postId);
    }
}
