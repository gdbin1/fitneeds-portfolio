package com.project.app.payment.service;

import com.project.app.ticket.domain.PassLog;
import java.util.List;

public interface PassLogService {
    List<PassLog> findAll();
    PassLog findById(Long passLogId);
    PassLog create(PassLog passlog);
    PassLog update(PassLog passlog);
    void delete(Long passLogId);
}
