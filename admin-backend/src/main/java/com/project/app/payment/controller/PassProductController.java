// Fixed @PathVariable name issue
package com.project.app.payment.controller;

import com.project.app.product.domain.PassProduct;
import com.project.app.payment.service.PassProductService;
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
@RequestMapping("/api/pass-product")
@RequiredArgsConstructor
@Tag(name = "이용권 상품 관리 (Pass Product Management)", description = "이용권 상품 관리 API")
public class PassProductController {
    
    private final PassProductService passproductService;
    
    @Operation(summary = "전체 이용권 상품 목록 조회", description = "모든 이용권 상품 정보를 조회합니다.")
    @ApiResponse(responseCode = "200", description = "이용권 상품 목록 조회 성공")
    @GetMapping
    public ResponseEntity<List<PassProduct>> findAll() {
        return ResponseEntity.ok(passproductService.findAll());
    }
    
    @Operation(summary = "특정 이용권 상품 조회", description = "상품 ID로 특정 이용권 상품 정보를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "이용권 상품 정보 조회 성공"),
        @ApiResponse(responseCode = "404", description = "이용권 상품을 찾을 수 없음")
    })
    @GetMapping("/{prodId}")
    public ResponseEntity<PassProduct> findById(
        @Parameter(description = "상품 ID", required = true, example = "1")
        @PathVariable("prodId") Long prodId) {
        PassProduct passproduct = passproductService.findById(prodId);
        if (passproduct == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(passproduct);
    }
    
    @Operation(summary = "이용권 상품 생성", description = "새로운 이용권 상품을 등록합니다.")
    @ApiResponse(responseCode = "200", description = "이용권 상품 생성 성공")
    @PostMapping
    public ResponseEntity<PassProduct> create(@RequestBody PassProduct passproduct) {
        return ResponseEntity.ok(passproductService.create(passproduct));
    }
    
    @Operation(summary = "이용권 상품 정보 수정", description = "기존 이용권 상품 정보를 수정합니다.")
    @ApiResponse(responseCode = "200", description = "이용권 상품 정보 수정 성공")
    @PutMapping("/{prodId}")
    public ResponseEntity<PassProduct> update(
        @Parameter(description = "상품 ID", required = true, example = "1")
        @PathVariable("prodId") Long prodId, 
        @RequestBody PassProduct passproduct) {
        passproduct.setProdId(prodId);
        return ResponseEntity.ok(passproductService.update(passproduct));
    }
    
    @Operation(summary = "이용권 상품 삭제", description = "이용권 상품을 삭제합니다.")
    @ApiResponse(responseCode = "200", description = "이용권 상품 삭제 성공")
    @DeleteMapping("/{prodId}")
    public ResponseEntity<Void> delete(
        @Parameter(description = "상품 ID", required = true, example = "1")
        @PathVariable("prodId") Long prodId) {
        passproductService.delete(prodId);
        return ResponseEntity.ok().build();
    }
}
