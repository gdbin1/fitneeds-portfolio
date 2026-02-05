package com.project.app.faq.service;

import com.project.app.faq.dto.FAQDto;
import com.project.app.faq.mapper.AdminFAQMapper;
import com.project.app.userAdmin.entity.UserAdmin;
import com.project.app.userAdmin.repository.UserAdminRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminFAQService {

    private final AdminFAQMapper adminFAQMapper;
    private final UserAdminRepository userAdminRepository;

    public AdminFAQService(AdminFAQMapper adminFAQMapper,
                           UserAdminRepository userAdminRepository) {
        this.adminFAQMapper = adminFAQMapper;
        this.userAdminRepository = userAdminRepository;
    }

    /* =========================
       FAQ 목록 조회 (페이징)
    ========================= */
    @Transactional(readOnly = true)
    public PagedResult<FAQDto> getFAQListPaged(String keyword, Boolean visible, int page) {
        int size = 10;
        int offset = (page - 1) * size;

        List<FAQDto> list =
                adminFAQMapper.selectFAQListPaged(keyword, visible, size, offset);

        int totalCount = adminFAQMapper.selectFAQCount(keyword, visible);
        int totalPages = (int) Math.ceil((double) totalCount / size);

        return new PagedResult<>(list, totalCount, page, totalPages);
    }

    @Transactional(readOnly = true)
    public FAQDto getFAQDetail(Long postId) {
        return adminFAQMapper.selectFAQDetail(postId);
    }

    /* =========================
       FAQ 등록
    ========================= */
    @Transactional
    public Long createFAQ(FAQDto dto) {

        // 게시글 기본 정보
        dto.setPostType("FAQ");
        dto.setWriterType("ADMIN");

        // 🔥 현재 로그인 관리자
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String adminUserId = auth.getName();   // users_admin.user_id
        dto.setWriterId(adminUserId);

        // 🔥 관리자 소속 지점
        UserAdmin admin = userAdminRepository
                .findByUserId(adminUserId)
                .orElseThrow(() -> new RuntimeException("관리자 정보 없음"));
        dto.setBranchId(admin.getBrchId());

        // 기본 노출값
        if (dto.getIsVisible() == null) dto.setIsVisible(true);
        if (dto.getPostVisible() == null) dto.setPostVisible(true);

        adminFAQMapper.insertFAQ(dto);
        return dto.getPostId();
    }

    /* =========================
       FAQ 수정
    ========================= */
    @Transactional
    public void updateFAQ(FAQDto dto) {
        adminFAQMapper.updateFAQ(dto);
    }

    /* =========================
       노출 여부 변경
    ========================= */
    @Transactional
    public void updateFAQVisible(Long postId, boolean visible) {
        adminFAQMapper.updateFAQVisible(postId, visible);
    }

    /* =========================
       FAQ 삭제 (논리삭제)
    ========================= */
    @Transactional
    public void deleteFAQ(Long postId) {
        adminFAQMapper.deleteFAQ(postId);
    }

    /* =========================
       페이징 DTO
    ========================= */
    public static class PagedResult<T> {
        private final List<T> list;
        private final int totalCount;
        private final int currentPage;
        private final int totalPages;

        public PagedResult(List<T> list, int totalCount, int currentPage, int totalPages) {
            this.list = list;
            this.totalCount = totalCount;
            this.currentPage = currentPage;
            this.totalPages = totalPages;
        }

        public List<T> getList() { return list; }
        public int getTotalCount() { return totalCount; }
        public int getCurrentPage() { return currentPage; }
        public int getTotalPages() { return totalPages; }
    }
}
