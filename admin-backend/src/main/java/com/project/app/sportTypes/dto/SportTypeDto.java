package com.project.app.sportTypes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class SportTypeDto {
    public record CreateReq(
            @NotBlank @Size(max=100) String name,
            @Size(max=500) String memo
    ) {}

    public record UpdateReq(
        @NotBlank @Size(max=100) String name,
        @Size(max=500) String memo
    ) {}

    public record Resp(
       Long sportId,
       String sportNm,
       String sportMemo,
       int useYn,
       LocalDateTime regDt,
       LocalDateTime updDt,
       LocalDateTime delDt
    ) {}
}
