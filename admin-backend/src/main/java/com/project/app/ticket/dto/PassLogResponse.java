package com.project.app.ticket.dto;

import java.time.LocalDateTime;

public record PassLogResponse(
        Long logId,
        String chgTypeCd,
        Integer chgCnt,
        String chgRsn,
        String processedByName,
        LocalDateTime regDt
) {
}




