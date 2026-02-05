package com.project.app.product.repository;

import com.project.app.product.entity.PassProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PassProductRepository extends JpaRepository<PassProduct, Long> {
    // 상품 ID로 상품 정보 찾기 (기본 제공 findById 사용)
}

