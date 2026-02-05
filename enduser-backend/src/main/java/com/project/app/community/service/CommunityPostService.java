package com.project.app.community.service;

import com.project.app.community.dto.CommunityPostDto;
import com.project.app.community.mapper.CommunityPostMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class CommunityPostService {

    private final CommunityPostMapper communityPostMapper;

    public CommunityPostService(CommunityPostMapper communityPostMapper) {
        this.communityPostMapper = communityPostMapper;
    }

    /**
     * USER 커뮤니티 글 등록
     */
    @Transactional
    public void createCommunityPost(CommunityPostDto dto) {

        // 🔥 MEMBER → USER 로 변경
        dto.setWriterType("USER");
        dto.setPostType("COMMUNITY");
        dto.setIsVisible(true);
        dto.setPostVisible(true);
        dto.setViews(0);

        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()
                || dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("필수값 누락 (title, content)");
        }

        int result = communityPostMapper.insertCommunityPost(dto);

        if (result != 1) {
            throw new IllegalStateException("커뮤니티 글 등록 실패");
        }
    }

    @Transactional(readOnly = true)
    public List<CommunityPostDto> getVisibleCommunityPostList() {
        List<CommunityPostDto> list =
                communityPostMapper.selectVisibleCommunityPostList();

        applyRecruitStatus(list);
        return list;
    }

    @Transactional(readOnly = true)
    public PagedResult<CommunityPostDto> getVisibleCommunityPostListPaged(int page, int size) {

        int offset = (page - 1) * size;

        List<CommunityPostDto> list =
                communityPostMapper.selectVisibleCommunityPostListPaged(offset, size);

        int totalCount =
                communityPostMapper.selectVisibleCommunityPostCount();

        applyRecruitStatus(list);

        int totalPages = (int) Math.ceil((double) totalCount / size);

        return new PagedResult<>(
                list,
                totalCount,
                page,
                totalPages
        );
    }

    @Transactional(readOnly = true)
    public List<CommunityPostDto> getMyCommunityPostList(String userId) {

        List<CommunityPostDto> list =
                communityPostMapper.selectMyCommunityPostList(userId);

        applyRecruitStatus(list);
        return list;
    }

    @Transactional
    public CommunityPostDto getCommunityPostDetail(Long postId) {

        communityPostMapper.increaseViews(postId);

        CommunityPostDto dto =
                communityPostMapper.selectCommunityPostDetail(postId);

        if (dto != null) {
            applyRecruitStatus(List.of(dto));
        }

        return dto;
    }

    @Transactional
    public void updateCommunityPost(Long postId, String userId, CommunityPostDto dto) {

        int isOwner =
                communityPostMapper.countByPostIdAndWriterId(postId, userId);

        if (isOwner == 0) {
            throw new IllegalStateException("수정 권한이 없습니다.");
        }

        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()
                || dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("제목과 내용은 필수입니다.");
        }

        dto.setPostId(postId);

        int result =
                communityPostMapper.updateCommunityPost(dto);

        if (result != 1) {
            throw new IllegalStateException("게시글 수정 실패");
        }
    }

    @Transactional
    public void deleteCommunityPost(Long postId, String userId) {

        int isOwner =
                communityPostMapper.countByPostIdAndWriterId(postId, userId);

        if (isOwner == 0) {
            throw new IllegalStateException("삭제 권한이 없습니다.");
        }

        int result =
                communityPostMapper.deleteCommunityPost(postId);

        if (result != 1) {
            throw new IllegalStateException("게시글 삭제 실패");
        }
    }

    private void applyRecruitStatus(List<CommunityPostDto> list) {

        LocalDate today = LocalDate.now();

        for (CommunityPostDto dto : list) {

            if (!"모집".equals(dto.getCategory())) {
                continue;
            }

            boolean isEndDatePassed =
                    dto.getRecruitEndDate() != null
                    && today.isAfter(dto.getRecruitEndDate());

            boolean isFull =
                    dto.getRecruitCount() != null
                    && dto.getRecruitMax() != null
                    && dto.getRecruitCount() >= dto.getRecruitMax();

            if (isEndDatePassed || isFull) {
                dto.setRecruitStatus("모집종료");
            } else {
                dto.setRecruitStatus("모집중");
            }
        }
    }

    @Transactional(readOnly = true)
    public PagedResult<CommunityPostDto> getVisibleCommunityPostListPaged(int page) {
        return getVisibleCommunityPostListPaged(page, 10);
    }

    public record PagedResult<T>(
            List<T> list,
            int totalCount,
            int currentPage,
            int totalPages
    ) {}
}
