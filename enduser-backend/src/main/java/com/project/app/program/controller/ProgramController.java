package com.project.app.program.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.app.aspect.ApiResponse;
import com.project.app.program.dto.ProgramResponseDto;
import com.project.app.program.service.ProgramService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/programs")
@RequiredArgsConstructor
@Slf4j
public class ProgramController {

	private final ProgramService programService;

	/**
	 * 특정 프로그램 ID에 해당하는 상세 정보를 조회합니다. 프론트엔드에서 예약 페이지 구성 시 프로그램의 상세 정보(금액, 종목 등)를
	 * 불러오기 위해 사용됩니다.
	 *
	 * @param progId 조회할 프로그램의 고유 ID
	 * @return 프로그램 정보를 담은 ApiResponse DTO (성공 시 200, 없을 시 404, 오류 시 500)
	 */
	@GetMapping("/getProgramByProgIdForR/{progId}")
	public ResponseEntity<ApiResponse<ProgramResponseDto>> getProgramByProgIdForR(@PathVariable("progId") Long progId,
			@RequestParam("userId") String userId) {
		try {
			// 서비스에서 프로그램 정보와 특정 강사 정보를 조합해서 가져옴
			ProgramResponseDto dto = programService.getProgramByProgId(progId, userId);

			return ResponseEntity.ok(ApiResponse.success(dto));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(ApiResponse.error("상세 정보를 불러오는 중 오류가 발생했습니다."));
		}
	}

}
