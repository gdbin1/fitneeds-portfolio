package com.project.app.order.controller;

import java.util.HashMap;
import java.util.Map;

import com.project.app.order.dto.ProductPaymentRequestDto;
import com.project.app.order.dto.PurchaseResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.app.order.service.PurchaseService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping("/orders/purchase")
    public ResponseEntity<?> purchase(@RequestBody ProductPaymentRequestDto req) {
        try {
            // 간단한 요청 검증
            if (req == null) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "요청 바디가 필요합니다.");
                return ResponseEntity.badRequest().body(err);
            }
            if (req.userId() == null || req.userId().isBlank()) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "userId는 필수입니다.");
                return ResponseEntity.badRequest().body(err);
            }
            if (req.prodId() == null) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "prodId는 필수입니다.");
                return ResponseEntity.badRequest().body(err);
            }

            PurchaseResponseDto resp = purchaseService.purchase(req);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        } catch (Exception e) {
            // 상세 로그를 남겨 문제 원인을 빠르게 파악하도록 함
            log.error("[PurchaseController] purchase() unexpected error: {}", e.getMessage(), e);
            Map<String, String> err = new HashMap<>();
            err.put("error", "서버 오류가 발생했습니다.");
            err.put("exception", e.getClass().getSimpleName());
            err.put("message", e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }
}
