package com.project.app.payment.service;

import com.project.app.payment.domain.Payment;
import com.project.app.payment.mapper.PaymentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {
    
    private final PaymentMapper paymentMapper;
    
    // PassProductService와 PassLogService는 나중에 필요시 추가
    // private final PassProductService passProductService;
    // private final PassLogService passLogService;
    
    @Override
    public List<Payment> findAll() {
        return paymentMapper.findAll();
    }
    
    @Override
    public Payment findById(Long payId) {
        return paymentMapper.findById(payId);
    }
    
    @Override
    public Payment create(Payment payment) {
        paymentMapper.insert(payment);
        
        // 결제 생성 시 자동으로 PURCHASE 타입의 로그 생성 기능은
        // PassProductService와 PassLogService가 구현되면 활성화
    /*
    if (payment.getRefId() != null && payment.getPayId() != null) {
        PassProduct product = passProductService.findById(payment.getRefId());
        if (product != null) {
            PassLog passLog = PassLog.builder()
                .userPassId(payment.getPayId())
                .chgTypeCd("PURCHASE")
                .chgCnt(product.getPrvCnt())
                .chgRsn("상품 구매")
                .userId(payment.getUserId())
                .regDt(LocalDateTime.now())
                .build();
            passLogService.create(passLog);
        }
    }
    */

        return payment;
    }
    
    @Override
    public Payment update(Payment payment) {
        paymentMapper.update(payment);
        return payment;
    }
    
    @Override
    public void delete(Long payId) {
        paymentMapper.delete(payId);
    }
}
