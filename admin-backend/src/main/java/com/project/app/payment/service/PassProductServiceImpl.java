package com.project.app.payment.service;

import com.project.app.product.domain.PassProduct;
import com.project.app.product.mapper.PassProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PassProductServiceImpl implements PassProductService {
    
    private final PassProductMapper passproductMapper;
    
    @Override
    public List<PassProduct> findAll() {
        return passproductMapper.findAll();
    }
    
    @Override
    public PassProduct findById(Long prodId) {
        return passproductMapper.findById(prodId);
    }
    
    @Override
    public PassProduct create(PassProduct passproduct) {
        passproductMapper.insert(passproduct);
        return passproduct;
    }
    
    @Override
    public PassProduct update(PassProduct passproduct) {
        passproductMapper.update(passproduct);
        return passproduct;
    }
    
    @Override
    public void delete(Long prodId) {
        passproductMapper.delete(prodId);
    }
}
