package com.project.app.faq.service;

import com.project.app.faq.dto.FAQDto;
import com.project.app.faq.mapper.FAQMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FAQService {

    private final FAQMapper faqMapper;

    public FAQService(FAQMapper faqMapper) {
        this.faqMapper = faqMapper;
    }

    /**
     * =========================
     * USER FAQ 목록 조회
     * =========================
     */
    public List<FAQDto> getUserFaqList() {
        return faqMapper.selectUserFaqList();
    }

    /**
     * =========================
     * USER FAQ 상세 조회
     * - 펼쳐진 상태에서 내용 표시용
     * - 조회수 개념 없음
     * =========================
     */
    public FAQDto getUserFaqDetail(Long postId) {
        return faqMapper.selectUserFaqDetail(postId);
    }
}
