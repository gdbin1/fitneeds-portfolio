package com.project.app.aspect;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ApiResponse<T> {

	private String resultCode;
	private String message;
	private T data;
	
	public static <T> ApiResponse<T> success(T data) {
		return ApiResponse.<T>builder()
				.resultCode("SUCCESS")
				.message("조회 성공")
				.data(data)
				.build();
	}
	
	public static <T> ApiResponse<T> success(T data, String message) {
	    return new ApiResponse<>("SUCCESS", message, data);
	}
	
	public static <T> ApiResponse<T> error(String message) {
		return ApiResponse.<T>builder()
				.resultCode("ERROR")
				.message(message)
				.data(null)
				.build();
	}
}
