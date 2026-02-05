package com.project.app.order.controller;

import com.project.app.order.dto.ProductPaymentRequestDto;
import com.project.app.order.dto.ProductPaymentResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.app.order.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/orders")
    public ResponseEntity<ProductPaymentResponseDto> createOrder(@RequestBody ProductPaymentRequestDto req) {
        return ResponseEntity.ok(orderService.createOrder(req));
    }
}

