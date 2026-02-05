package com.project.app.payment.service;

import com.project.app.ticket.domain.PassLog;
import com.project.app.ticket.mapper.PassLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PassLogServiceImpl implements PassLogService {
    
    private final PassLogMapper passlogMapper;
    
    @Override
    public List<PassLog> findAll() {
        return passlogMapper.findAll();
    }
    
    @Override
    public PassLog findById(Long passLogId) {
        return passlogMapper.findById(passLogId);
    }
    
    @Override
    public PassLog create(PassLog passlog) {
        passlogMapper.insert(passlog);
        return passlog;
    }
    
    @Override
    public PassLog update(PassLog passlog) {
        passlogMapper.update(passlog);
        return passlog;
    }
    
    @Override
    public void delete(Long passLogId) {
        passlogMapper.delete(passLogId);
    }
}
