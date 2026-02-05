package com.project.app.program.service;

import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.app.admin.dto.TeacherInfoResponseDto;
import com.project.app.admin.service.TeacherProfileAndCertificateService;
import com.project.app.program.dto.ProgramResponseDto;
import com.project.app.program.entity.Program;
import com.project.app.program.repository.ProgramRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProgramService {

	private final ProgramRepository programRepository;
	private final TeacherProfileAndCertificateService teacherProfileAndCertificateService;
	
	@Transactional
	public ProgramResponseDto getProgramByProgId(Long progId, String userId) {
		// 1. 프로그램 정보 조회
	    Program program = programRepository.findById(progId)
	            .orElseThrow(() -> new NoSuchElementException("프로그램을 찾을 수 없습니다."));
	
	    TeacherInfoResponseDto teacherInfo = teacherProfileAndCertificateService.getTeacherInfo(userId);
	
		return ProgramResponseDto.from(program, teacherInfo);
	}

}
