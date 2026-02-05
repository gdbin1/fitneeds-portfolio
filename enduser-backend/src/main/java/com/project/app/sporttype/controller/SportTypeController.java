package com.project.app.sporttype.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.app.aspect.ApiResponse;
import com.project.app.sporttype.dto.SportTypeResponseDto;
import com.project.app.sporttype.entity.SportType;
import com.project.app.sporttype.service.SportTypeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/sporttypes")
@RequiredArgsConstructor
@Slf4j
public class SportTypeController {

	private final SportTypeService sportTypeService;
	
	/**
     * 현재 시스템에 등록된 모든 운동 종목(Sport Type) 목록을 조회합니다.
     * 프론트엔드 예약 화면에서 카테고리 필터링이나 종목 선택 기능을 구성할 때 사용됩니다.
     *
     * @return 등록된 모든 운동 종목 정보를 담은 ApiResponse 리스트 (성공 시 200, 오류 시 500)
     */
	@GetMapping("/getAllSportTypesForR")
	public ResponseEntity<ApiResponse<List<SportTypeResponseDto>>> getAllSportTypesForR() {
		try {
			List<SportType> sportTypes = sportTypeService.getAllSportTypes();
			List<SportTypeResponseDto> result = sportTypes.stream()
		            .map(SportTypeResponseDto::from)
		            .collect(Collectors.toList());
			
			return ResponseEntity.ok(ApiResponse.success(result));
		} catch (Exception e) {
			log.error("조회 실패: ", e);
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body(ApiResponse.error("조회 중 오류 발생: " + e.getMessage()));
		}		
	}
	
}
