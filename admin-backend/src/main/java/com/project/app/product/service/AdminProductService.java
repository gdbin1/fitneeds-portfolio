package com.project.app.product.service;

import com.project.app.global.dto.PagedResponse;
import com.project.app.product.dto.ProductCreateRequest;
import com.project.app.product.dto.ProductResponse;
import com.project.app.product.dto.ProductSearchRequest;
import com.project.app.product.dto.ProductUpdateRequest;
import com.project.app.product.entity.PassProduct;
import com.project.app.product.mapper.PassProductMapper;
import com.project.app.product.repository.PassProductRepository;
import com.project.app.sportTypes.entity.SportType;
import com.project.app.sportTypes.repository.SportTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminProductService {

    private final PassProductRepository productRepository;
    private final PassProductMapper productMapper;
    private final SportTypeRepository sportTypeRepository;

    // 페이징 처리된 리스트 조회
    public PagedResponse<ProductResponse> getPagedProductList(ProductSearchRequest request) {
        // 1. 전체 데이터 개수 조회
        int total = productMapper.countProductList(request);

        // 2. 현재 페이지 데이터 조회
        List<ProductResponse> list = productMapper.selectProductList(request);

        // 3. PagedResponse로 반환
        return PagedResponse.of(list, total, request.paging());
    }

    //리스트조회
    public List<ProductResponse> getProductList(ProductSearchRequest request) {
        return productMapper.selectProductList(request);
    }

    // 2. 상세 조회 (JPA -> DTO 변환)
    public ProductResponse getProductDetail(Long productId) {
        return ProductResponse.from(findProductById(productId));
    }

    @Transactional
    public void createProduct(ProductCreateRequest request) {
        SportType sportType = sportTypeRepository.findById(request.sportId())
                .orElseThrow(() -> new IllegalArgumentException("스포츠 종목 정보를 찾을 수 없습니다."));

        PassProduct product = PassProduct.builder()
                .sport(sportType)
                .prodNm(request.prodNm())
                .prodAmt(request.prodAmt())
                .prvCnt(request.prvCnt())
                .build();

        productRepository.save(product);
    }

    //정보수정
    @Transactional
    public void updateProduct(Long productId, ProductUpdateRequest request) {
        PassProduct product = findProductById(productId);

        product.updateInfo(
                request.prodNm(),
                request.prodAmt(),
                request.prvCnt()
        );
    }

    //상태변경
    @Transactional
    public void updateProductStatus(Long productId, Boolean useYn) {
        PassProduct product = findProductById(productId);
        product.updateStatus(useYn);
    }

    //6. 삭제
    @Transactional
    public void deleteProduct(Long productId) {
        PassProduct product = findProductById(productId);
        productRepository.delete(product);
    }

    private PassProduct findProductById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 정보를 찾을 수 없습니다."));
    }
}
