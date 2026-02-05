package com.project.app.review.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;

/*
 * 예약 단위 리뷰 DTO - 리뷰 작성 가능 여부 판단, 리뷰 내용, 별점 포함
 * */

@Data
public class ReservationReviewDto {

    private Long reservationId;
    private LocalDate exerciseDate;

    private String productName;
    private String teacherName;
    private String facilityName;

    private Integer rating;
    private String content;

    private LocalDateTime registrationDateTime;
}