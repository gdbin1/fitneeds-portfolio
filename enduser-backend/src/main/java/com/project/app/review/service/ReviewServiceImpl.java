package com.project.app.review.service;

import com.project.app.review.dto.ReviewDto;
import com.project.app.review.mapper.ReviewMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewMapper reviewMapper;

    public ReviewServiceImpl(ReviewMapper reviewMapper) {
        this.reviewMapper = reviewMapper;
    }

    public void createReview(ReviewDto reviewDto) {
        log.info("[ReviewServiceImpl] 리뷰 작성 시작 - reservationId: {}", reviewDto.getReservationId());
        reviewMapper.insertReview(reviewDto);
        log.info("[ReviewServiceImpl] 리뷰 작성 완료");
    }

    public List<ReviewDto> getMyReviewList(String userId) {
        log.info("[ReviewServiceImpl] getMyReviewList 호출됨 - userId: {}", userId);
        try {
            List<ReviewDto> result = reviewMapper.selectMyReviewList(userId);
            log.info("[ReviewServiceImpl] 조회 성공 - 결과 개수: {}", result != null ? result.size() : 0);
            return result;
        } catch (Exception e) {
            log.error("[ReviewServiceImpl] 조회 실패 - userId: {}, 에러: {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    public void updateReview(Long reviewId, ReviewDto reviewDto) {
        int count = reviewMapper.countByReviewIdAndUserId(reviewId, reviewDto.getUserId());
        if (count == 0) {
            throw new RuntimeException("권한이 없습니다. 본인 리뷰만 수정 가능합니다.");
        }
        reviewDto.setReviewId(reviewId);
        reviewMapper.updateReview(reviewDto);
    }

    public void deleteReview(Long reviewId, String userId) {
        log.info("[ReviewServiceImpl] 리뷰 삭제 시작 - reviewId: {}, userId: {}", reviewId, userId);
        
        int count = reviewMapper.countByReviewIdAndUserId(reviewId, userId);
        if (count == 0) {
            throw new RuntimeException("권한이 없습니다. 본인 리뷰만 삭제 가능합니다.");
        }
        
        reviewMapper.deleteReview(reviewId);
        log.info("[ReviewServiceImpl] 리뷰 삭제 완료 - reviewId: {}", reviewId);
    }

    @Override
    public void updateReview(Long reviewId, String userId, ReviewDto reviewDto) {
        // TODO Auto-generated method stub
    }
}