package com.project.app.review.service;

import com.project.app.review.dto.ReviewDto;

import java.util.List;

public interface ReviewService {

    /**
     * 리뷰 등록
     */
    void createReview(ReviewDto reviewDto);

    /**
     * 내가 쓴 리뷰 목록 조회
     */
    List<ReviewDto> getMyReviewList(String userId);

    /**
     * 리뷰 수정
     */
    void updateReview(Long reviewId, String userId, ReviewDto reviewDto);

    /**
     * 리뷰 삭제 (소프트 삭제)
     */
    void deleteReview(Long reviewId, String userId);
}