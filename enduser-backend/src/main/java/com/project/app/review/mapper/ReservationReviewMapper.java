package com.project.app.review.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.project.app.review.dto.ReservationReviewDto;

@Mapper
public interface ReservationReviewMapper {

    List<ReservationReviewDto> selectCompletedReservationsForReview(
            @Param("userId") String userId
    );
}