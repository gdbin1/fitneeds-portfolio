package com.project.app.passfaq.controller;

import com.project.app.passfaq.dto.PassFaqCreateRequest;
import com.project.app.passfaq.dto.PassFaqResponse;
import com.project.app.passfaq.dto.PassFaqUpdateRequest;

import com.project.app.passfaq.service.PassFaqService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.project.app.passfaq.dto.PassFaqAnswerRequest;

import java.util.List;
import java.util.Map;

/**
 * 이용권 FAQ (Q&A) 사용자용 컨트롤러
 *
 * 역할:
 * - 사용자의 질문(Q) CRUD 처리
 * - 관리자가 등록한 답변(A) 조회
 *

 */
@Tag(name = "이용권 FAQ", description = "이용권 Q&A (사용자 질문 / 관리자 답변 조회 API)")
@RestController
@RequestMapping("/api/passfaq")
@RequiredArgsConstructor
public class PassFaqController {

    private final PassFaqService passFaqService;

    /**
     * FAQ(Q&A) 목록 조회
     * - 전체 조회
     * - 카테고리별 필터링 조회
     */
    @Operation(
            summary = "FAQ(Q&A) 목록 조회",
            description = "이용권 관련 질문(Q&A) 목록을 조회합니다. 카테고리 필터링이 가능합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "FAQ 목록 조회 성공"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping
    public ResponseEntity<List<PassFaqResponse>> getFaqList(
            @RequestParam(required = false) String category
    ) {
        return ResponseEntity.ok(passFaqService.getFaqList(category));
    }

    /**
     * FAQ(Q&A) 상세 조회
     * - 조회수 증가 포함
     */
    @Operation(
            summary = "FAQ(Q&A) 상세 조회",
            description = "특정 FAQ(Q&A)의 상세 내용을 조회합니다. 조회 시 조회수가 증가합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "FAQ 상세 조회 성공"),
            @ApiResponse(responseCode = "404", description = "FAQ를 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{faqId}")
    public ResponseEntity<PassFaqResponse> getFaq(
            @PathVariable Long faqId
    ) {
        return ResponseEntity.ok(passFaqService.getFaq(faqId));
    }

    /**
     * FAQ(Q&A) 질문 등록
     * - 사용자 질문 등록
     */
    @Operation(
            summary = "FAQ(Q&A) 질문 등록",
            description = "사용자가 이용권 관련 질문(Q&A)을 등록합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "질문 등록 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping
    public ResponseEntity<Void> createFaq(
            @RequestBody PassFaqCreateRequest request,
            Authentication authentication
    ) {
        // 🔥 로그인한 사용자 ID (JWT 기준)
        String userId = authentication.getName();
        passFaqService.createFaq(request, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * FAQ(Q&A) 질문 수정
     * - 답변이 등록되지 않은 질문만 수정 가능
     */
    @Operation(
            summary = "FAQ(Q&A) 질문 수정",
            description = "사용자가 등록한 질문을 수정합니다. 답변 완료된 질문은 수정할 수 없습니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "질문 수정 성공"),
            @ApiResponse(responseCode = "400", description = "답변 완료된 질문 수정 불가"),
            @ApiResponse(responseCode = "404", description = "FAQ를 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PutMapping("/{faqId}")
    public ResponseEntity<Void> updateFaq(
            @PathVariable Long faqId,
            @RequestBody PassFaqUpdateRequest request
    ) {
        passFaqService.updateFaq(faqId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * FAQ(Q&A) 질문 삭제
     */
    @Operation(
            summary = "FAQ(Q&A) 질문 삭제",
            description = "사용자가 등록한 질문(Q&A)을 삭제합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "질문 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "FAQ를 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping("/{faqId}")
    public ResponseEntity<?> deleteFaq(
            @PathVariable Long faqId,
            Authentication authentication
    ) {
        passFaqService.deleteFaq(faqId, authentication.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * FAQ(Q&A) 답변 등록
     * - 관리자 프로젝트 없이 사용자 답변 구조
     */
    @Operation(
            summary = "FAQ 답변 등록",
            description = "특정 FAQ(Q&A)에 답변을 등록합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "답변 등록 성공"),
            @ApiResponse(responseCode = "404", description = "FAQ 없음"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping("/{faqId}/answer")
    public ResponseEntity<Void> answerFaq(
            @PathVariable Long faqId,
            @RequestBody PassFaqAnswerRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        passFaqService.answerFaq(faqId, request.getAnswer(), userId);
        return ResponseEntity.ok().build();
    }


}
