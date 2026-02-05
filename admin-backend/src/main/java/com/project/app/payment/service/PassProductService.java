package com.project.app.payment.service;

import com.project.app.product.domain.PassProduct;
import java.util.List;

public interface PassProductService {
    List<PassProduct> findAll();
    PassProduct findById(Long prodId);
    PassProduct create(PassProduct passproduct);
    PassProduct update(PassProduct passproduct);
    void delete(Long prodId);
}
