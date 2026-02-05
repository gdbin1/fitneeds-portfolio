package com.project.app.payment.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.app.payment.dto.MyPaymentResponseDto;
import com.project.app.payment.service.MyPaymentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 나의 결제 내역 관련 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class MyPaymentController {

    private final MyPaymentService myPaymentService;

    /**
     * 로그인한 사용자의 결제 목록을 조회합니다.
     * POST /payment/my
     *
     * 프론트엔드 요청 형식:
     * {
     *   "userId": "user123"
     * }
     *
     * 프론트엔드가 response.data를 배열로 직접 기대하므로 배열을 직접 반환합니다.
     *
     * @param requestBody 요청 본문 (userId 포함)
     * @return 결제 목록 배열
     */
    @PostMapping("/my")
    public ResponseEntity<List<MyPaymentResponseDto>> getMyPayments(@RequestBody Map<String, String> requestBody) {
        try {
            // JWT 토큰에서 사용자 ID 추출
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String tokenUserId = authentication.getName();

            // 요청 본문에서 userId 추출 (프론트엔드 호환성)
            String requestUserId = requestBody != null ? requestBody.get("userId") : null;

            // 토큰의 userId를 우선 사용 (보안상 더 안전)
            String userId = tokenUserId != null && !tokenUserId.isEmpty() ? tokenUserId : requestUserId;

            if (userId == null || userId.isEmpty()) {
                log.warn("[MyPaymentController] 사용자 ID가 없음");
                return ResponseEntity.badRequest().body(List.of());
            }

            log.info("[MyPaymentController] 결제 목록 조회 요청 - userId: {}", userId);

            // 결제 목록 조회
            List<MyPaymentResponseDto> payments = myPaymentService.getMyPayments(userId);

            log.info("[MyPaymentController] 결제 목록 조회 완료 - 개수: {}", payments.size());

            // 프론트엔드가 기대하는 형식: 배열을 직접 반환
            return ResponseEntity.ok(payments);

        } catch (Exception e) {
            log.error("[MyPaymentController] 결제 목록 조회 중 오류 발생", e);

            // 오류 발생 시 빈 배열 반환 (프론트엔드 호환성)
            return ResponseEntity.internalServerError().body(List.of());
        }
    }

    /**
     * 결제를 취소합니다.
     * DELETE /api/payment/{paymentId}
     *
     * @param paymentId 취소할 결제 ID
     * @param cancelReason 취소 사유 (선택사항)
     * @return 취소 결과 응답
     */
    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Map<String, Object>> cancelPayment(
            @PathVariable Long paymentId,
            @RequestParam(value = "cancelReason", required = false) String cancelReason) {
        try {
            // JWT 토큰에서 사용자 ID 추출
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userId = authentication.getName();

            if (userId == null || userId.isEmpty()) {
                log.warn("[MyPaymentController] 사용자 ID가 없음");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            log.info("[MyPaymentController] 결제 취소 요청 - paymentId: {}, userId: {}", paymentId, userId);

            // 결제 취소 처리
            boolean success = myPaymentService.cancelPayment(paymentId, userId, cancelReason);

            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            response.put("message", "결제가 취소되었습니다.");

            log.info("[MyPaymentController] 결제 취소 완료 - paymentId: {}", paymentId);

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            log.warn("[MyPaymentController] 결제 취소 실패 - paymentId: {}, 오류: {}", paymentId, e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);

        } catch (NoSuchElementException e) {
            log.warn("[MyPaymentController] 결제를 찾을 수 없음 - paymentId: {}", paymentId);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            log.error("[MyPaymentController] 결제 취소 중 오류 발생 - paymentId: {}", paymentId, e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "결제 취소 중 오류가 발생했습니다: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}