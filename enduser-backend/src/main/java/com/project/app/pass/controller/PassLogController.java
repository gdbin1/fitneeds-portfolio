package com.project.app.pass.controller;

import com.project.app.userpass.entity.PassLog;
import com.project.app.pass.service.PassLogQueryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * [PASS]
 * 이용권 로그 조회 전용 컨트롤러
 *
 * - 상태 변경 API 없음
 * - 조회 전용
 * - 트랜잭션 없음
 *
 * ✔ 로그 생성/변경 로직은 userpass.service 영역에서만 처리
 */
@Tag(name = "이용권 로그 조회 API", description = "이용권 사용 및 증감 이력 조회")
@RestController
@RequestMapping("/api/userpass/pass-logs")
@RequiredArgsConstructor
public class PassLogController {

    // 조회 전용 서비스
    private final PassLogQueryService passLogQueryService;

    @Operation(summary = "사용자 이용권 로그 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "사용자 이용권 로그 조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 사용자 ID"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping
    public ResponseEntity<List<PassLog>> getPassLogsByUser(
            @RequestParam String userId
    ) {
        return ResponseEntity.ok(
                passLogQueryService.getPassLogsByUserId(userId)
        );
    }

    @Operation(summary = "이용권별 로그 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "이용권 로그 조회 성공"),
            @ApiResponse(responseCode = "404", description = "이용권 로그 조회 실패"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{userPassId}")
    public ResponseEntity<List<PassLog>> getPassLogsByUserPass(
            @PathVariable Long userPassId
    ) {
        return ResponseEntity.ok(
                passLogQueryService.getPassLogsByUserPassId(userPassId)
        );
    }
}
