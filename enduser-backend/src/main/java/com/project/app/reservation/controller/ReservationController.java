package com.project.app.reservation.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.app.reservation.dto.MyReservationResponseDto;
import com.project.app.reservation.dto.PastHistoryResponseDto;
import com.project.app.reservation.service.ReservationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 예약 관련 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    /**
     * 로그인한 사용자의 예약 목록을 조회합니다.
     *
     * GET /api/reservations/myReservations
     *
     * @return 예약 목록 응답
     */
    @GetMapping("/myReservations")
    public ResponseEntity<Map<String, Object>> getMyReservations() {
        try {
            // JWT 토큰에서 사용자 ID 추출
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userId = authentication.getName();

            log.info("[ReservationController] 예약 목록 조회 요청 - userId: {}", userId);

            // 예약 목록 조회
            List<MyReservationResponseDto> reservations = reservationService.getMyReservations(userId);

            // 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", "SUCCESS");
            response.put("message", "조회 성공");
            response.put("data", reservations);

            log.info("[ReservationController] 예약 목록 조회 완료 - 개수: {}", reservations.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("[ReservationController] 예약 목록 조회 중 오류 발생", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", "ERROR");
            errorResponse.put("message", "예약 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
            errorResponse.put("data", null);

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * 예약을 취소합니다.
     *
     * DELETE /api/reservations/{rsvId}
     *
     * @param rsvId 예약 ID
     * @param cancelReason 취소 사유 (선택사항)
     * @return 취소 결과 응답
     */
    @DeleteMapping("/{rsvId}")
    public ResponseEntity<Map<String, Object>> cancelReservation(
            @PathVariable("rsvId") Long rsvId,
            @RequestParam(value = "cancelReason", required = false) String cancelReason) {
        try {
            // JWT 토큰에서 사용자 ID 추출
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userId = authentication.getName();

            log.info("[ReservationController] 예약 취소 요청 - rsvId: {}, userId: {}", rsvId, userId);

            // 예약 취소 처리
            reservationService.cancelReservation(rsvId, userId, cancelReason);

            // 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", "SUCCESS");
            response.put("message", "예약이 취소되었습니다.");
            response.put("data", null);

            log.info("[ReservationController] 예약 취소 완료 - rsvId: {}", rsvId);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("[ReservationController] 예약 취소 실패 (잘못된 요청) - rsvId: {}", rsvId, e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", "BAD_REQUEST");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("data", null);

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);

        } catch (IllegalStateException e) {
            log.warn("[ReservationController] 예약 취소 실패 (상태 오류) - rsvId: {}", rsvId, e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", "BAD_REQUEST");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("data", null);

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);

        } catch (Exception e) {
            log.error("[ReservationController] 예약 취소 중 오류 발생 - rsvId: {}", rsvId, e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", "ERROR");
            errorResponse.put("message", "예약 취소 중 오류가 발생했습니다: " + e.getMessage());
            errorResponse.put("data", null);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/completedReservations")
    public ResponseEntity<Map<String,Object>> getCompletedReservations() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        List<PastHistoryResponseDto> data = reservationService.getCompletedReservations(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("resultCode", "SUCCESS");
        response.put("message", "조회 성공");
        response.put("data", data);

        return ResponseEntity.ok(response);
    }

}