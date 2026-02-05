package com.project.app.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import io.swagger.v3.oas.annotations.Hidden;


/**
 * ✅ [Web 레이어] 전역 예외 처리기
 *
 * 목적:
 * - Service에서 터진 "비즈니스 예외"가 401(인증 오류)처럼 보이지 않게 막는다.
 * - 프론트가 400/409/500을 구분해서 처리할 수 있게 해준다.
 */
@Hidden
@Profile("!swagger")
@RestControllerAdvice

public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(
            IllegalArgumentException e,
            HttpServletRequest request
    ) {
        if (isSwaggerRequest(request)) {
            throw new RuntimeException(e);
        }
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalState(
            IllegalStateException e,
            HttpServletRequest request
    ) {
        if (isSwaggerRequest(request)) {
            throw new RuntimeException(e);
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(
            Exception e,
            HttpServletRequest request
    ) {
        if (isSwaggerRequest(request)) {
            throw new RuntimeException(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("서버 오류: " + e.getMessage());
    }

    private boolean isSwaggerRequest(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri.startsWith("/swagger-ui")
                || uri.startsWith("/v3/api-docs");
    }
}
