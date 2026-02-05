package com.project.app.ticket.controller;

import com.project.app.global.dto.BasePagingRequest;
import com.project.app.global.dto.PagedResponse;
import com.project.app.sportTypes.dto.SportSearchResponse;
import com.project.app.ticket.dto.UserPassCreateRequest;
import com.project.app.ticket.dto.UserPassResponse;
import com.project.app.ticket.dto.UserPassSearchRequest;
import com.project.app.ticket.dto.UserPassUpdateRequest;
import com.project.app.ticket.service.AdminPassService;
import com.project.app.user.dto.UserSearchResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "[관리자] 회원이용권 관리", description = "회원 이용권 조회, 수동 등록, 수정, 삭제 API")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user-pass")
public class AdminPassController {
    private final AdminPassService userPassService;

    @Operation(summary = "이용권 목록 조회", description = "검색 조건에 따라 전체 목록을 반환합니다.")
    @GetMapping
    public ResponseEntity<PagedResponse<UserPassResponse>> getPasses(
            @Valid UserPassSearchRequest request
    ) {
        PagedResponse<UserPassResponse> response = userPassService.getPassList(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "회원별 이용권 목록", description = "특정 회원이 현재 예약에 사용할 수 있는(상태가 'ACTIVE'인) 이용권")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserPassResponse>> getUserPasses(@PathVariable String userId) {
        return ResponseEntity.ok(userPassService.getUserActivePasses(userId));
    }

    @Operation(summary = "이용권 상세 조회", description = "관리자가 특정 회원의 이용권을 상세 조회하며, 전체 변동 이력을 함께 반환합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<UserPassResponse> getPassDetail(@PathVariable Long id) {
        UserPassResponse response = userPassService.getPassDetail(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "이용권 수동 등록", description = "관리자가 특정 회원에게 이용권을 직접 부여합니다. (초기 이력 생성됨)")
    @PostMapping
    public ResponseEntity<String> createPass(
            @Valid @RequestBody UserPassCreateRequest request
    ) {
        userPassService.createPass(request);
        return ResponseEntity.ok("이용권이 등록되었습니다.");
    }

    @Operation(summary = "이용권 정보 수정", description = "횟수 오류 수정 등을 수행합니다. 변경 시 이력(History)이 남습니다.")
    @PutMapping("/{id}")
    public ResponseEntity<String> updatePass(
            @PathVariable Long id,
            @Valid @RequestBody UserPassUpdateRequest request
    ) {
        log.info("🔧 updatePass 요청 - id: {}, rmnCnt: {}, memo: {}", id, request.getRmnCnt(), request.getMemo());
        userPassService.updatePass(id, request);
        return ResponseEntity.ok("이용권 정보가 수정되었습니다.");
    }

    @Operation(summary = "이용권 상태 변경", description = "정지(STOP), 활성화(ACTIVE) 등을 수행합니다. 변경 시 이력(History)이 남습니다.")
    @PatchMapping("/{id}/status")
    public ResponseEntity<String> updatePassStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        userPassService.updatePassStatus(id, status);
        return ResponseEntity.ok("상태가 변경되었습니다.");
    }

    @Operation(summary = "이용권 삭제", description = "회원이용권을 삭제(전액 회수 및 DELETED 처리) 수행합니다. 이력이 남습니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePass(@PathVariable Long id) {
        userPassService.deletePass(id);
        return ResponseEntity.ok("이용권이 삭제되었습니다.");
    }

    @Operation(summary = "회원 검색", description = "이용권 등록 시 회원을 검색합니다. (이름 또는 ID로 검색)")
    @GetMapping("/search-users")
    public ResponseEntity<List<UserSearchResponse>> searchUsers(@RequestParam String keyword) {
        return ResponseEntity.ok(userPassService.searchUsers(keyword));
    }

    @Operation(summary = "활성 스포츠 목록 조회", description = "Option 박스용 전체 스포츠 리스트를 반환합니다.")
    @GetMapping("/sports/active")
    public ResponseEntity<List<SportSearchResponse>> getActiveSports() {
        return ResponseEntity.ok(userPassService.getActiveSports());
    }

    @Operation(summary = "이용권 복구", description = "관리자가 삭제된 이용권을 복구합니다.")
    @PatchMapping("/{id}/restore")
    public ResponseEntity<String> restorePass(@PathVariable Long id) {
        userPassService.restorePass(id);
        return ResponseEntity.ok("이용권이 복구되었습니다.");
    }
}
