package com.project.app.faq.mapper;

import com.project.app.faq.dto.FAQDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FAQMapper {

    /**
     * USER FAQ 목록 조회
     * - post_type = 'FAQ'
     * - is_visible = true
     */
    List<FAQDto> selectUserFaqList();

    /**
     * USER FAQ 상세 조회
     * - 펼쳐진 상태에서 내용 표시용
     */
    FAQDto selectUserFaqDetail(@Param("postId") Long postId);
}
