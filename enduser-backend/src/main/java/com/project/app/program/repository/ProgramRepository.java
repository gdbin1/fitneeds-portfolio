package com.project.app.program.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.app.program.entity.Program;

@Repository
public interface ProgramRepository extends JpaRepository<Program, Long> {
	
}
