package com.project.app.product.mapper;

import com.project.app.product.domain.PassProduct;
import com.project.app.product.dto.ProductResponse;
import com.project.app.product.dto.ProductSearchRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PassProductMapper {
    List<PassProduct> findAll();
    PassProduct findById(@Param("prodId") Long prodId);
    int insert(PassProduct passproduct);
    int update(PassProduct passproduct);
    int delete(@Param("prodId") Long prodId);
    List<ProductResponse> selectProductList(ProductSearchRequest request);

    int countProductList(ProductSearchRequest request);
}
