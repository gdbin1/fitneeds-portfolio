package com.project.app.branch.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.app.aspect.ApiResponse;
import com.project.app.branch.dto.BranchResponseDto;
import com.project.app.branch.entity.Branch;
import com.project.app.branch.service.BranchService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
@Slf4j
public class BranchController {

	private final BranchService branchService;
	
	/**
     * 현재 등록된 모든 지점(Branch) 목록을 조회합니다.
     * 사용자가 예약 시 센터를 선택하거나 지점별 위치 정보를 확인할 때 사용됩니다.
     *
     * @return 모든 지점 정보를 담은 ApiResponse 리스트 (성공 시 200, 오류 시 500)
     */
	@GetMapping("/getAllBranchesForR")
	public ResponseEntity<ApiResponse<List<BranchResponseDto>>> getAllBranchesForR() {
		try {
			// 1. 서비스에서 모든 지점 엔티티 조회
            List<Branch> branches = branchService.getAllBranches();
            
            // 2. Entity 리스트를 Response DTO 리스트로 변환
            List<BranchResponseDto> result = branches.stream()
                    .map(BranchResponseDto::from)
                    .toList();
            
            log.info("모든 지점 목록 조회 성공 - 총 {}건", result.size());
            
            // 3. 공통 응답 포맷으로 감싸서 반환
            return ResponseEntity.ok(ApiResponse.success(result));
		} catch (Exception e) {
			// 4. 예외 발생 시 로그를 남기고 일관된 에러 응답 반환
            log.error("지점 목록 조회 중 서버 오류 발생: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("지점 목록을 불러오는 중 오류가 발생했습니다."));
		}
	}
}
