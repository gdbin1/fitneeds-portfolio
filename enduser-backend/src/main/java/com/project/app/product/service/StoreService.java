package com.project.app.product.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.app.product.dto.ProductDto;
import com.project.app.product.entity.PassProduct;
import com.project.app.product.repository.PassProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final PassProductRepository passProductRepository;

    @Transactional(readOnly = true)
    public List<ProductDto> listAvailableProducts() {
        return passProductRepository.findByUseYnTrue().stream()
                .map(p -> ProductDto.of(p, p.getSport().getSportNm()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDto getProduct(Long prodId) {
        PassProduct p = passProductRepository.findById(prodId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
        return ProductDto.of(p, p.getSport().getSportNm());
    }
}
