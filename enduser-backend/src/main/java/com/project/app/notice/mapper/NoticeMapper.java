package com.project.app.notice.mapper;

import com.project.app.notice.dto.NoticeDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NoticeMapper {

    /**
     * USER 공지 목록 조회
     * - post_type = NOTICE
     * - is_visible = true
     * - 최신순
     */
    List<NoticeDto> selectNoticeList();

    /**
     * USER 공지 상세 조회
     * - is_visible = true
     */
    NoticeDto selectNoticeDetail(
            @Param("postId") Long postId
    );

    /**
     * 조회수 증가
     * - is_visible = true 인 경우만 증가
     */
    int increaseViews(
            @Param("postId") Long postId
    );
}
