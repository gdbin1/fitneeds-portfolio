package com.project.app.payment.mapper;

import com.project.app.payment.domain.Payment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PaymentMapper {
    List<Payment> findAll();
    Payment findById(@Param("payId") Long payId);
    int insert(Payment payment);
    int update(Payment payment);
    int delete(@Param("payId") Long payId);
}


