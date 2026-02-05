package com.project.app.community.service;

import com.project.app.community.dto.CommunityPostDto;
import com.project.app.community.mapper.CommunityPostDetailMapper;
import com.project.app.community.mapper.CommunityRecruitJoinMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class CommunityRecruitJoinService {

    private final CommunityRecruitJoinMapper recruitJoinMapper;
    private final CommunityPostDetailMapper communityPostDetailMapper;

    public CommunityRecruitJoinService(
            CommunityRecruitJoinMapper recruitJoinMapper,
            CommunityPostDetailMapper communityPostDetailMapper
    ) {
        this.recruitJoinMapper = recruitJoinMapper;
        this.communityPostDetailMapper = communityPostDetailMapper;
    }

    /**
     * =========================
     * 모집 글 참여 신청
     * =========================
     */
    @Transactional
    public void applyRecruit(Long postId, String userId) {

        CommunityPostDto post =
                communityPostDetailMapper.selectVisiblePostDetail(postId);

        if (post == null) {
            throw new IllegalArgumentException("존재하지 않는 게시글입니다.");
        }

        if (!"모집".equals(post.getCategory())) {
            throw new IllegalStateException("모집 글만 참여 신청이 가능합니다.");
        }

        if (userId.equals(post.getWriterId())) {
            throw new IllegalStateException("작성자는 참여 신청할 수 없습니다.");
        }

        if (post.getRecruitEndDate() != null &&
                post.getRecruitEndDate().isBefore(LocalDate.now())) {
            throw new IllegalStateException("모집 기간이 종료된 모집입니다.");
        }

        int exists =
                recruitJoinMapper.countByPostIdAndUserId(postId, userId);

        if (exists > 0) {
            throw new IllegalStateException("이미 참여 신청한 모집입니다.");
        }

        int joinCount =
                recruitJoinMapper.countByPostId(postId);

        if (post.getRecruitMax() != null &&
                joinCount >= post.getRecruitMax()) {
            throw new IllegalStateException("모집 인원이 모두 찼습니다.");
        }

        recruitJoinMapper.insertRecruitJoin(postId, userId);
    }

    /**
     * =========================
     * 모집 참여 취소
     * =========================
     */
    @Transactional
    public void cancelRecruit(Long postId, String userId) {

        int exists =
                recruitJoinMapper.countByPostIdAndUserId(postId, userId);

        if (exists == 0) {
            throw new IllegalStateException("참여하지 않은 모집은 취소할 수 없습니다.");
        }

        recruitJoinMapper.deleteRecruitJoin(postId, userId);
    }

    /**
     * 이미 참여한 모집인지 여부 체크
     */
    @Transactional(readOnly = true)
    public boolean isAlreadyJoined(Long postId, String userId) {
        return recruitJoinMapper.countByPostIdAndUserId(postId, userId) > 0;
    }

    /**
     * 모집 글 신청자 ID 목록 조회
     */
    @Transactional(readOnly = true)
    public List<String> getJoinUsersByPostId(Long postId) {
        return recruitJoinMapper.selectJoinUsersByPostId(postId);
    }

    /**
     * =========================
     * 🔥 내가 참여한 모집 글 목록 조회 (핵심 수정)
     * =========================
     */
    @Transactional(readOnly = true)
    public List<CommunityPostDto> getMyJoinedRecruitPosts(String userId) {

        List<CommunityPostDto> list =
                recruitJoinMapper.selectMyJoinedRecruitPosts(userId);

        // 🔥 모집 상태 계산 (기간 만료 / 인원 도달)
        applyRecruitStatus(list);

        return list;
    }

    /**
     * =========================
     * 🔧 모집 상태 계산 로직
     * =========================
     */
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
}
