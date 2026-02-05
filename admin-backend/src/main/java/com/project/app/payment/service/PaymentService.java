package com.project.app.payment.service;

import com.project.app.payment.domain.Payment;
import java.util.List;

public interface PaymentService {
    List<Payment> findAll();
    Payment findById(Long payId);
    Payment create(Payment payment);
    Payment update(Payment payment);
    void delete(Long payId);
}


