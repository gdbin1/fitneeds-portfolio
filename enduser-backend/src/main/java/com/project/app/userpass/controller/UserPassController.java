package com.project.app.userpass.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.app.aspect.ApiResponse;
import com.project.app.userpass.dto.UserPassResponseDto;
import com.project.app.userpass.entity.UserPass;
import com.project.app.userpass.service.UserPassService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/userpasses")
@RequiredArgsConstructor
@Slf4j
public class UserPassController {

    private final UserPassService userPassService;

    /**
     * 특정 사용자의 이용권 목록 조회 (쿼리 파라미터 방식)
     * @param userId 사용자 ID
     * @return 이용권 목록
     */
    @GetMapping("/my-pass")
    public ResponseEntity<List<UserPassResponseDto>> getMyPasses(@RequestParam("userId") String userId) {
        try {
            List<UserPass> userPasses = userPassService.getUserPassesByUserIdForR(userId);
            List<UserPassResponseDto> result = userPasses.stream()
                    .map(UserPassResponseDto::from)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("사용자 이용권 조회 실패 - userId: {}, error: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * 특정 사용자 ID에 해당하는 모든 이용권 목록을 조회합니다.
     * 이 메서드는 사용자의 현재 예약 가능 또는 사용 완료된 이용권 정보를 프론트엔드에 제공합니다.
     *
     * @param userId 조회할 사용자의 ID (문자열 타입으로 가정)
     * @return 해당 사용자의 UserPass 정보를 담은 응답 DTO 목록
     */
	@GetMapping("/getUserPassesByUserIdForR/{userId}")
	public ResponseEntity<ApiResponse<List<UserPassResponseDto>>> getUserPassesByUserIdForR(@PathVariable("userId") String userId) {
		try {
			List<UserPass> userPasses = userPassService.getUserPassesByUserIdForR(userId);
			
			List<UserPassResponseDto> result = userPasses.stream()
	                .map(UserPassResponseDto::from)
	                .collect(Collectors.toList());
			return ResponseEntity.ok(ApiResponse.success(result));
		} catch (Exception e) {
			log.error("사용자 이용권 조회 실패 - userId: {}, error: {}", userId, e.getMessage());
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body(ApiResponse.error("이용권 정보를 불러오는 중 오류가 발생했습니다."));
		}
		
	}
	

    /**
     * 예외 발생 시 일관된 ApiResponse 포맷으로 응답합니다.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException e) {
    	return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
    }
}