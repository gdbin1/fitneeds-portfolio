package com.project.app.community.service;

import com.project.app.community.dto.CommunityCommentDto;
import com.project.app.community.dto.CommunityPostDto;
import com.project.app.community.mapper.CommunityPostDetailMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class CommunityPostDetailService {

    private final CommunityPostDetailMapper mapper;

    public CommunityPostDetailService(CommunityPostDetailMapper mapper) {
        this.mapper = mapper;
    }

    @Transactional
    public CommunityPostDto getVisiblePostDetail(Long postId, String loginUserId) {

        mapper.increaseViewCount(postId);

        CommunityPostDto post = mapper.selectVisiblePostDetail(postId);

        if (post == null) {
            throw new IllegalArgumentException("존재하지 않는 게시글입니다.");
        }

        if ("모집".equals(post.getCategory())
                && post.getRecruitEndDate() != null) {

            LocalDate today = LocalDate.now();

            if (post.getRecruitEndDate().isBefore(today)) {
                post.setRecruitStatus("모집종료");
            } else {
                post.setRecruitStatus("모집중");
            }
        }

        // 🔥 작성자 여부 판단 (USERS 기준)
        if (loginUserId != null && post.getWriterId() != null) {
            post.setIsWriter(loginUserId.equals(post.getWriterId()));
        } else {
            post.setIsWriter(false);
        }

        return post;
    }

    @Transactional(readOnly = true)
    public List<CommunityCommentDto> getVisibleCommentsByPostId(Long postId) {
        return mapper.selectVisibleCommentsByPostId(postId);
    }

    @Transactional
    public void createComment(Long postId, CommunityCommentDto commentDto) {
        commentDto.setPostId(postId);
        mapper.insertComment(commentDto);
    }
}
