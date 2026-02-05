package com.project.app.community.mapper;

import com.project.app.community.dto.CommunityCommentDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminCommunityCommentMapper {

    // ADMIN 댓글 목록 조회 (전체)
    List<CommunityCommentDto> selectCommentsByPostIdPaged(
            @Param("postId") Long postId
    );

    int selectCommentCountByPostId(
            @Param("postId") Long postId
    );

    void updateCommentVisible(
            @Param("commentId") Long commentId,
            @Param("commentVisible") Integer commentVisible
    );

    void deleteComment(
            @Param("commentId") Long commentId
    );
    
    void deleteByPostId(
            @Param("postId") Long postId
    );
}
