package com.project.app.program.service;

import com.project.app.program.domain.Program;
import java.util.List;

public interface ProgramService {
    List<Program> findAll();
    Program findById(Long progId);
    Program create(Program program);
    Program update(Program program);
    void delete(Long progId);
}
