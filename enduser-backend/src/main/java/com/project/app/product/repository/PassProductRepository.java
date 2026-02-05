package com.project.app.product.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.app.product.entity.PassProduct;

@Repository
public interface PassProductRepository extends JpaRepository<PassProduct, Long> {
    List<PassProduct> findByUseYnTrue();
}

