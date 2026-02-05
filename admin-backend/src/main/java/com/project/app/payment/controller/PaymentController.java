// Fixed @PathVariable name issue
package com.project.app.payment.controller;

import com.project.app.payment.domain.Payment;
import com.project.app.payment.service.PaymentService;
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
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Tag(name = "결제 관리 (Payment Management)", description = "결제 정보 관리 API - 결제 생성 시 이용권 로그(PURCHASE) 자동 생성")
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @Operation(summary = "전체 결제 목록 조회", description = "모든 결제 정보를 조회합니다.")
    @ApiResponse(responseCode = "200", description = "결제 목록 조회 성공")
    @GetMapping
    public ResponseEntity<List<Payment>> findAll() {
        return ResponseEntity.ok(paymentService.findAll());
    }
    
    @Operation(summary = "특정 결제 조회", description = "결제 ID로 특정 결제 정보를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "결제 정보 조회 성공"),
        @ApiResponse(responseCode = "404", description = "결제를 찾을 수 없음")
    })
    @GetMapping("/{payId}")
    public ResponseEntity<Payment> findById(
        @Parameter(description = "결제 ID", required = true, example = "1")
        @PathVariable("payId") Long payId) {
        Payment payment = paymentService.findById(payId);
        if (payment == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(payment);
    }
    
    @Operation(
        summary = "결제 생성", 
        description = "새로운 결제를 등록합니다. 결제 생성 시 이용권 로그(PURCHASE 타입)가 자동으로 생성됩니다."
    )
    @ApiResponse(responseCode = "200", description = "결제 생성 성공 (이용권 로그 자동 생성됨)")
    @PostMapping
    public ResponseEntity<Payment> create(@RequestBody Payment payment) {
        return ResponseEntity.ok(paymentService.create(payment));
    }
    
    @Operation(summary = "결제 정보 수정", description = "기존 결제 정보를 수정합니다.")
    @ApiResponse(responseCode = "200", description = "결제 정보 수정 성공")
    @PutMapping("/{payId}")
    public ResponseEntity<Payment> update(
        @Parameter(description = "결제 ID", required = true, example = "1")
        @PathVariable("payId") Long payId, 
        @RequestBody Payment payment) {
        payment.setPayId(payId);
        return ResponseEntity.ok(paymentService.update(payment));
    }
    
    @Operation(summary = "결제 삭제", description = "결제를 삭제합니다.")
    @ApiResponse(responseCode = "200", description = "결제 삭제 성공")
    @DeleteMapping("/{payId}")
    public ResponseEntity<Void> delete(
        @Parameter(description = "결제 ID", required = true, example = "1")
        @PathVariable("payId") Long payId) {
        paymentService.delete(payId);
        return ResponseEntity.ok().build();
    }
}
