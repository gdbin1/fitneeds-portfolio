package com.project.app.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 이용내역의 리뷰 조회 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistoryReviewResponseDto {

    private Long reviewId;
    private Long reservationId;
    private Integer rating;
    private String content;
    private String instructorId;
    private String registrationDateTime; // ISO 8601 형식 문자열
}