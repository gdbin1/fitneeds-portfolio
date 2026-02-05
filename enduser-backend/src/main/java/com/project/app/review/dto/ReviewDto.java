package com.project.app.review.dto;

import java.util.Date;

public class ReviewDto {

    private Long reviewId;
    private String title;
    private String content;

    /** 작성자 ID */
    private String userId;

    private String userType; // 작성자 유형 (선택적)
    private Long reservationId; // 리뷰 대상 예약 ID (하위 호환성)
    private Long historyId; // 리뷰 대상 이용내역 ID
    private Integer rating; // 별점 등 평가 점수
    private Date createdAt;
    private Date updatedAt;

    private Boolean isVisible; // 리뷰 공개 여부

    /** 로그인 사용자 기준 작성자 여부 */
    private Boolean isWriter;

    /* ===== getter / setter ===== */

    public Long getReviewId() {
        return reviewId;
    }

    public void setReviewId(Long reviewId) {
        this.reviewId = reviewId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public Long getHistoryId() {
        return historyId;
    }

    public void setHistoryId(Long historyId) {
        this.historyId = historyId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getIsVisible() {
        return isVisible;
    }

    public void setIsVisible(Boolean isVisible) {
        this.isVisible = isVisible;
    }

    public Boolean getIsWriter() {
        return isWriter;
    }

    public void setIsWriter(Boolean isWriter) {
        this.isWriter = isWriter;
    }
}