package com.project.app.program.service;

import com.project.app.program.domain.Program;
import com.project.app.program.mapper.ProgramMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProgramServiceImpl implements ProgramService {
    
    private final ProgramMapper programMapper;
    
    @Override
    public List<Program> findAll() {
        return programMapper.findAll();
    }
    
    @Override
    public Program findById(Long progId) {
        return programMapper.findById(progId);
    }
    
    @Override
    public Program create(Program program) {
        // 등록일과 수정일 설정 (등록 시점)
        LocalDateTime now = LocalDateTime.now();
        program.setRegDt(now);
        program.setUpdDt(now);
        
        programMapper.insert(program);
        return program;
    }
    
    @Override
    public Program update(Program program) {
        // 수정일 설정 (수정 시점)
        program.setUpdDt(LocalDateTime.now());
        
        programMapper.update(program);
        return program;
    }
    
    @Override
    public void delete(Long progId) {
        try {
            int result = programMapper.delete(progId);
            if (result == 0) {
                throw new IllegalArgumentException("Program not found with id: " + progId);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete program: " + e.getMessage(), e);
        }
    }
}
