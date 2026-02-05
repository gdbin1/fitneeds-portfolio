package com.project.app.review.service;

import com.project.app.review.dto.ReservationReviewDto;
import com.project.app.review.mapper.ReservationReviewMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationReviewService {

    private final ReservationReviewMapper reservationReviewMapper;

    public List<ReservationReviewDto> getCompletedReservationsForReview(String userId) {
        return reservationReviewMapper.selectCompletedReservationsForReview(userId);
    }
}