package com.project.app.pass.controller;

import com.project.app.userpass.dto.UserPassResponseDto;
import com.project.app.userpass.entity.UserPass;
import com.project.app.userpass.service.UserPassService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "내 이용권 API", description = "사용자 보유 이용권 조회/사용")
@RestController
@RequestMapping("/api/pass/passes")
@RequiredArgsConstructor
public class PassController {

    // 공통 userpass 서비스 사용
    private final UserPassService userPassService;

    @Operation(summary = "내 이용권 목록 조회", description = "사용자가 보유한 모든 이용권을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "이용권 목록 조회 성공"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping
    public ResponseEntity<List<UserPass>> getUserPasses(
            @RequestParam String userId
    ) {
        return ResponseEntity.ok(
                userPassService.getUserPassesByUserIdForR(userId)
        );
    }

    @Operation(
            summary = "내 이용권 목록 조회 (API)",
            description = "프론트/API용 이용권 목록 조회 (DTO 반환)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "이용권 목록 조회 성공"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/api")
    public ResponseEntity<List<UserPassResponseDto>> getUserPassResponses(
            @RequestParam String userId
    ) {

        return ResponseEntity.ok(
                userPassService.getUserPassResponses(userId)
        );
    }



    @Operation(summary = "이용권 사용", description = "이용권을 1회 사용하여 잔여 횟수를 차감합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "이용권 사용 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping("/{userPassId}/use")
    public ResponseEntity<UserPass> useUserPass(
            @PathVariable Long userPassId,
            @RequestParam(required = false) String reason
    ) {
        UserPass userPass = userPassService.usePassForR(
                userPassId,
                reason != null ? reason : "이용권 사용"
        );
        return ResponseEntity.ok(userPass);
    }
}
