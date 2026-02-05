package com.project.app.reservation.controller;

import com.project.app.config.security.SecurityHelper;
import com.project.app.global.dto.PagedResponse;
import com.project.app.reservation.dto.*;
import com.project.app.reservation.service.AdminReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "[관리자] 예약 관리", description = "예약 조회, 등록, 수정, 취소 API")
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class AdminReservationController {

    private final AdminReservationService reservationService;
    private final SecurityHelper securityHelper;

    @Operation(summary = "예약 목록 조회", description = "검색 조건에 따라 예약 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<PagedResponse<ReservationResponse>> getReservations(
            @Valid ReservationSearchRequest request // @ModelAttribute는 생략 가능 (Record 바인딩)
    ) {
        PagedResponse<ReservationResponse> list = reservationService.getReservationList(request);
        return ResponseEntity.ok(list);
    }

    @Operation(summary = "예약 상세 조회", description = "특정 예약의 상세 정보를 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> getReservationDetail(@PathVariable Long id) {
        ReservationResponse response = reservationService.getReservationDetail(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "예약 수동 등록", description = "관리자가 예약을 수동으로 등록합니다.")
    @PostMapping
    public ResponseEntity<String> createReservation(
            @Valid @RequestBody ReservationCreateRequest request
    ) {
        String adminId = securityHelper.getCurrentAdminUserId();
        reservationService.createReservation(request, adminId);
        return ResponseEntity.ok("예약이 등록되었습니다.");
    }

    @Operation(summary = "예약 정보 수정", description = "예약 정보를 수정합니다.")
    @PatchMapping("/{id}")
    public ResponseEntity<String> updateReservation(
            @PathVariable Long id,
            @RequestBody ReservationUpdateRequest request
    ) {
        String adminId = securityHelper.getCurrentAdminUserId();
        reservationService.updateReservation(id, request, adminId);
        return ResponseEntity.ok("예약 정보가 수정되었습니다.");
    }

    @Operation(summary = "예약 취소", description = "예약을 취소합니다.")
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<String> cancelReservation(
            @PathVariable Long id,
            @Valid @RequestBody ReservationCancelRequest request
    ) {
        String adminId = securityHelper.getCurrentAdminUserId();
        reservationService.cancelReservation(id, request, adminId);
        return ResponseEntity.ok("예약이 취소되었습니다.");
    }

    @Operation(summary = "예약 상태 변경", description = "예약 상태를 변경합니다. (이용완료, 노쇼 등)")
    @PatchMapping("/{id}/status")
    public ResponseEntity<String> updateReservationStatus(
            @PathVariable Long id,
            @Valid @RequestBody ReservationStatusChangeRequest request
    ) {
        String adminId = securityHelper.getCurrentAdminUserId();
        reservationService.updateReservationStatus(id, request, adminId);
        return ResponseEntity.ok("예약 상태가 변경되었습니다.");
    }
}
