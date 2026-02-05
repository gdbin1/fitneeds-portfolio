package com.project.app.faq.mapper;

import com.project.app.faq.dto.FAQDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminFAQMapper {

    // ✅ Service에서 호출: selectFAQListPaged(keyword, visible, size, offset)
    List<FAQDto> selectFAQListPaged(
            @Param("keyword") String keyword,
            @Param("visible") Boolean visible,
            @Param("size") int size,
            @Param("offset") int offset
    );

    // ✅ Service에서 호출: selectFAQCount(keyword, visible)
    int selectFAQCount(
            @Param("keyword") String keyword,
            @Param("visible") Boolean visible
    );

    // ✅ Service에서 호출: selectFAQDetail(postId)
    FAQDto selectFAQDetail(@Param("postId") Long postId);

    int insertFAQ(FAQDto dto);

    int updateFAQ(FAQDto dto);

    int updateFAQVisible(
            @Param("postId") Long postId,
            @Param("visible") boolean visible
    );

    int deleteFAQ(@Param("postId") Long postId);
}
