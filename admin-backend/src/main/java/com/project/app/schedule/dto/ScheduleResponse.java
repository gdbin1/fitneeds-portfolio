package com.project.app.schedule.dto;

import java.time.LocalTime;

public record ScheduleResponse(
        Long schdId,
        String programName,
        String instructorName,
        LocalTime strtTm,
        LocalTime endTm,
        Integer maxNopCnt,
        Integer rsvCnt,
        String sttsCd
) {
}
