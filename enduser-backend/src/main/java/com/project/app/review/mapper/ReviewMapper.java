package com.project.app.review.mapper;

import com.project.app.review.dto.ReviewDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ReviewMapper {

    /**
     * 리뷰 등록
     */
    int insertReview(ReviewDto reviewDto);

    /**
     * 내가 쓴 리뷰 목록 조회 (USER)
     */
    List<ReviewDto> selectMyReviewList(
            @Param("userId") String userId
    );

    /**
     * 예약 ID로 리뷰 조회
     */
    List<ReviewDto> selectReviewByReservationId(
            @Param("reservationId") Long reservationId,
            @Param("userId") String userId
    );

    /**
     * 이용내역 ID로 리뷰 조회
     */
    List<ReviewDto> selectReviewByHistoryId(
            @Param("historyId") Long historyId,
            @Param("userId") String userId
    );

    /**
     * 리뷰 상세 조회
     */
    ReviewDto selectReviewDetail(
            @Param("reviewId") Long reviewId
    );

    /**
     * 리뷰 작성자 본인 여부 체크
     */
    int countByReviewIdAndUserId(
            @Param("reviewId") Long reviewId,
            @Param("userId") String userId
    );

    /**
     * 내가 쓴 리뷰 수정
     */
    int updateReview(ReviewDto reviewDto);

    /**
     * 내가 쓴 리뷰 삭제 (소프트 삭제)
     */
    int deleteReview(
            @Param("reviewId") Long reviewId
    );
}