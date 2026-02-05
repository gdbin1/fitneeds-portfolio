package com.project.app.program.mapper;

import com.project.app.program.domain.Program;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ProgramMapper {
    List<Program> findAll();
    Program findById(@Param("progId") Long progId);
    int insert(Program program);
    int update(Program program);
    int delete(@Param("progId") Long progId);
}
