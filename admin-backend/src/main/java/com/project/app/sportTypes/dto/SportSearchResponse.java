package com.project.app.sportTypes.dto;

import com.project.app.sportTypes.entity.SportType;

import java.time.LocalDateTime;

public record SportSearchResponse(
        Long sportId,
        String sportNm,
        String sportMemo,
        Boolean useYn,
        LocalDateTime regDt,
        LocalDateTime updDt
) {
    public static SportSearchResponse from(SportType sport) {
        return new SportSearchResponse(
                sport.getSportId(),
                sport.getSportNm(),
                sport.getSportMemo(),
                sport.getUseYn(),
                sport.getRegDt(),
                sport.getUpdDt()
        );
    }
}

