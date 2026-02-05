package com.project.app.passfaq.service;

import com.project.app.passfaq.dto.PassFaqCreateRequest;
import com.project.app.passfaq.dto.PassFaqResponse;
import com.project.app.passfaq.dto.PassFaqUpdateRequest;
import com.project.app.passfaq.entity.PassFaq;
import com.project.app.passfaq.repository.PassFaqRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PassFaqService {

    private final PassFaqRepository repository;

    /**
     * FAQ / QnA 목록 조회
     * - category 없으면 전체
     */
    @Transactional(readOnly = true)
    public List<PassFaqResponse> getFaqList(String category) {
        List<PassFaq> list =
                (category == null)
                        ? repository.findAll()
                        : repository.findByCategory(category);

        return list.stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * FAQ / QnA 단건 조회
     * ❗ 공통 DB에는 조회수 개념 없음
     */
    @Transactional(readOnly = true)
    public PassFaqResponse getFaq(Long faqId) {
        PassFaq faq = repository.findById(faqId)
                .orElseThrow(() -> new IllegalArgumentException("FAQ가 존재하지 않습니다."));

        return toResponse(faq);
    }

    /**
     * 질문 등록
     */
    @Transactional
    public void createFaq(PassFaqCreateRequest req, String userId) {
        PassFaq faq = new PassFaq();

        faq.setUserId(userId);
        faq.setCategory(req.getCategory());
        faq.setQuestion(req.getQuestion());

        faq.setCreatedAt(LocalDateTime.now());
        faq.setSortOrder(0);

        repository.save(faq);
    }

    /**
     * 질문 수정
     * - 답변이 없는 경우만 가능
     */
    @Transactional
    public void updateFaq(Long faqId, PassFaqUpdateRequest req) {
        PassFaq faq = repository.findById(faqId)
                .orElseThrow(() -> new IllegalArgumentException("FAQ가 존재하지 않습니다."));

        // 답변이 있으면 수정 불가
        if (faq.getAnswer() != null) {
            throw new IllegalStateException("답변 완료된 문의는 수정할 수 없습니다.");
        }

        faq.setQuestion(req.getQuestion());
    }

    /**
     * 질문 삭제
     */
    @Transactional
    public void deleteFaq(Long faqId, String loginUserId) {
        PassFaq faq = repository.findById(faqId)
                .orElseThrow(() -> new IllegalArgumentException("FAQ 없음"));

        // ✅ 작성자 본인 체크 (컬럼명이 userId 라는 전제)
        if (!faq.getUserId().equals(loginUserId)) {
            throw new IllegalStateException("본인 글만 삭제할 수 있습니다.");
        }

        repository.delete(faq);
    }

    /**
     * Entity → Response 변환
     */
    private PassFaqResponse toResponse(PassFaq faq) {
        PassFaqResponse dto = new PassFaqResponse();
        dto.setFaqId(faq.getFaqId());
        dto.setUserId(faq.getUserId());
        dto.setCategory(faq.getCategory());
        dto.setQuestion(faq.getQuestion());
        dto.setAnswer(faq.getAnswer());
        dto.setCreatedAt(faq.getCreatedAt());
        dto.setWriterName(faq.getUser().getUserName());
        return dto;
    }

    /**
     * FAQ 답변 등록
     * - 사용자 답변 허용 구조
     */
    @Transactional
    public void answerFaq(Long faqId, String answer, String userId) {

        if (answer == null || answer.trim().isEmpty()) {
            throw new IllegalArgumentException("답변 내용을 입력해주세요.");
        }

        PassFaq faq = repository.findById(faqId)
                .orElseThrow(() -> new IllegalArgumentException("FAQ가 존재하지 않습니다."));

        // (선택) 본인 글만 답변 가능하게 하고 싶으면 유지
        // 지금은 요구사항상 제한 없음 → 주석 처리

//    if (!faq.getUserId().equals(userId)) {
//        throw new IllegalStateException("본인 문의에만 답변할 수 있습니다.");
//    }

        faq.setAnswer(answer.trim());
        // JPA dirty checking → 트랜잭션 종료 시 자동 UPDATE
    }

}
