package com.project.app.community.mapper;

import com.project.app.community.dto.CommunityPostDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CommunityPostMapper {

    /**
     * =========================
     * USER 커뮤니티 글 등록
     * =========================
     */
    int insertCommunityPost(CommunityPostDto communityPostDto);

    /**
     * =========================
     * USER 커뮤니티 전체 글 목록 조회
     * (기존 - 유지)
     * =========================
     */
    List<CommunityPostDto> selectVisibleCommunityPostList();

    /**
     * =========================
     * ✅ USER 커뮤니티 전체 글 목록 조회 (페이징)
     * =========================
     */
    List<CommunityPostDto> selectVisibleCommunityPostListPaged(
            @Param("offset") int offset,
            @Param("size") int size
    );

    /**
     * =========================
     * ✅ USER 커뮤니티 전체 글 개수 조회 (페이징용)
     * =========================
     */
    int selectVisibleCommunityPostCount();

    /**
     * =========================
     * 🔥 내가 쓴 글 목록 조회 (USER)
     * =========================
     */
    List<CommunityPostDto> selectMyCommunityPostList(
            @Param("userId") String userId
    );

    /**
     * =========================
     * USER 커뮤니티 상세 조회
     * =========================
     */
    CommunityPostDto selectCommunityPostDetail(
            @Param("postId") Long postId
    );

    /**
     * =========================
     * 🔒 게시글 작성자 본인 여부 체크
     * =========================
     */
    int countByPostIdAndWriterId(
            @Param("postId") Long postId,
            @Param("writerId") String writerId
    );

    /**
     * =========================
     * ✏️ 내가 쓴 글 수정
     * =========================
     */
    int updateCommunityPost(CommunityPostDto communityPostDto);

    /**
     * =========================
     * 🗑 내가 쓴 글 삭제 (소프트 삭제)
     * =========================
     */
    int deleteCommunityPost(
            @Param("postId") Long postId
    );

    /**
     * =========================
     * 🔥 조회수 증가 (USER 상세 진입 시)
     * =========================
     */
    void increaseViews(
            @Param("postId") Long postId
    );
}
