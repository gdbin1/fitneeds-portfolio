// Fixed @PathVariable name issue
package com.project.app.payment.controller;

import com.project.app.ticket.domain.PassLog;
import com.project.app.payment.service.PassLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.Parameter;

import java.util.List;

@RestController
@RequestMapping("/api/pass-log")
@RequiredArgsConstructor
@Tag(name = "이용권 로그 관리 (Pass Log Management)", description = "이용권 변동 내역 관리 API - PURCHASE, USE, TRADE, REFUND, ADJUST")
public class PassLogController {
    
    private final PassLogService passlogService;
    
    @Operation(summary = "전체 이용권 로그 목록 조회", description = "모든 이용권 변동 내역을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "이용권 로그 목록 조회 성공")
    @GetMapping
    public ResponseEntity<List<PassLog>> findAll() {
        return ResponseEntity.ok(passlogService.findAll());
    }
    
    @Operation(summary = "특정 이용권 로그 조회", description = "로그 ID로 특정 이용권 로그 정보를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "이용권 로그 정보 조회 성공"),
        @ApiResponse(responseCode = "404", description = "이용권 로그를 찾을 수 없음")
    })
    @GetMapping("/{passLogId}")
    public ResponseEntity<PassLog> findById(
        @Parameter(description = "이용권 로그 ID", required = true, example = "1")
        @PathVariable("passLogId") Long passLogId) {
        PassLog passlog = passlogService.findById(passLogId);
        if (passlog == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(passlog);
    }
    
    @Operation(
        summary = "이용권 로그 생성", 
        description = "이용권 변동 내역을 등록합니다. 변경 유형: PURCHASE(구매), USE(사용), TRADE(거래), REFUND(환불), ADJUST(조정)"
    )
    @ApiResponse(responseCode = "200", description = "이용권 로그 생성 성공")
    @PostMapping
    public ResponseEntity<PassLog> create(@RequestBody PassLog passlog) {
        return ResponseEntity.ok(passlogService.create(passlog));
    }
    
    @Operation(summary = "이용권 로그 정보 수정", description = "기존 이용권 로그 정보를 수정합니다.")
    @ApiResponse(responseCode = "200", description = "이용권 로그 정보 수정 성공")
    @PutMapping("/{passLogId}")
    public ResponseEntity<PassLog> update(
        @Parameter(description = "이용권 로그 ID", required = true, example = "1")
        @PathVariable("passLogId") Long passLogId, 
        @RequestBody PassLog passlog) {
        passlog.setPassLogId(passLogId);
        return ResponseEntity.ok(passlogService.update(passlog));
    }
    
    @Operation(summary = "이용권 로그 삭제", description = "이용권 로그를 삭제합니다.")
    @ApiResponse(responseCode = "200", description = "이용권 로그 삭제 성공")
    @DeleteMapping("/{passLogId}")
    public ResponseEntity<Void> delete(
        @Parameter(description = "이용권 로그 ID", required = true, example = "1")
        @PathVariable("passLogId") Long passLogId) {
        passlogService.delete(passLogId);
        return ResponseEntity.ok().build();
    }
}
