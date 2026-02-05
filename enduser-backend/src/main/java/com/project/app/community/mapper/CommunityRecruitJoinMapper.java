package com.project.app.community.mapper;

import com.project.app.community.dto.CommunityPostDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CommunityRecruitJoinMapper {

    // =========================
    // 중복 참여 체크
    // =========================
    int countByPostIdAndUserId(@Param("postId") Long postId,
                               @Param("userId") String userId);

    // =========================
    // 모집 참여 인원 수 조회
    // =========================
    int countByPostId(@Param("postId") Long postId);

    // =========================
    // 참여 신청
    // =========================
    int insertRecruitJoin(@Param("postId") Long postId,
                          @Param("userId") String userId);

    // =========================
    // 참여 취소
    // =========================
    int deleteRecruitJoin(@Param("postId") Long postId,
                           @Param("userId") String userId);

    // =========================
    // 참여자 목록 조회 (작성자용)
    // =========================
    List<String> selectJoinUsersByPostId(@Param("postId") Long postId);

    // =========================
    // 🔥 내가 참여한 모집 글 목록 조회
    // =========================
    List<CommunityPostDto> selectMyJoinedRecruitPosts(
            @Param("userId") String userId
    );
}
