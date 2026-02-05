package com.project.app.product.controller;

import com.project.app.global.dto.BasePagingRequest;
import com.project.app.global.dto.PagedResponse;
import com.project.app.product.dto.ProductCreateRequest;
import com.project.app.product.dto.ProductResponse;
import com.project.app.product.dto.ProductSearchRequest;
import com.project.app.product.dto.ProductUpdateRequest;
import com.project.app.product.service.AdminProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "[관리자] 이용권 상품 관리", description = "이용권 상품 조회, 등록, 수정, 삭제 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pass-products")
public class AdminProductController {

    private final AdminProductService productService;

    @Operation(summary = "이용권 상품 목록 조회", description = "검색조건(종목, 사용여부, 상품명)에 따라 목록 반환")
    @GetMapping
    public ResponseEntity<PagedResponse<ProductResponse>> getProducts(
            @Valid ProductSearchRequest searchRequest
    ) {
        PagedResponse<ProductResponse> response = productService.getPagedProductList(searchRequest);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "이용권 상품 상세 조회", description = "해당 상품의 상세 정보를 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductDetail(@PathVariable Long id) {
        ProductResponse product = productService.getProductDetail(id);
        return ResponseEntity.ok(product);
    }

    @Operation(summary = "이용권 상품 등록", description = "새로운 이용권 상품을 등록합니다.")
    @PostMapping
    public ResponseEntity<String> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        productService.createProduct(request);
        return ResponseEntity.ok("이용권 상품이 등록되었습니다.");
    }

    @Operation(summary = "이용권 상품 수정", description = "상품명, 가격, 횟수 등을 수정합니다.")
    @PutMapping("/{id}")
    public ResponseEntity<String> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {
        productService.updateProduct(id, request);
        return ResponseEntity.ok("이용권 상품이 수정되었습니다.");
    }

    @Operation(summary = "이용권 상품 상태 변경", description = "상품 판매중지/활성화 합니다.")
    @PatchMapping("/{id}/status")
    public ResponseEntity<String> updateProductStatus(
            @PathVariable Long id,
            @Parameter(description = "true: 사용(노출), false: 미사용(숨김)")
            @RequestParam Boolean useYn
    ) {
        productService.updateProductStatus(id, useYn);
        String message = Boolean.TRUE.equals(useYn)
                ? "상품이 판매(노출) 상태로 변경되었습니다."
                : "상품이 판매 중지(미노출) 처리되었습니다.";
        return ResponseEntity.ok(message);
    }

    @Operation(summary = "이용권 상품 삭제", description = "상품을 영구 삭제합니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("상품이 삭제되었습니다.");
    }
}
