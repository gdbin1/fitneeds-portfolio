package com.project.app.sporttype.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.app.sporttype.entity.SportType;
import com.project.app.sporttype.repository.SportTypeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SportTypeService {

	private final SportTypeRepository sportTypeRepository;
	
	// 모든 종목 데이터 가져오기 메서드
	@Transactional
	public List<SportType> getAllSportTypes() {
		return sportTypeRepository.findAll();
	}
	
}
