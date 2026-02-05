package com.project.app.userpass.dto;

import com.project.app.userpass.entity.PassLog;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PassLogResponseDto {
    private Long passLogId;
    private Integer chgCnt;
    private String chgTypeCd;
    private String chgRsn;
    private LocalDateTime regDt;

    public static PassLogResponseDto of(PassLog pl) {
        return PassLogResponseDto.builder()
                .passLogId(pl.getPassLogId())
                .chgCnt(pl.getChgCnt())
                .chgTypeCd(pl.getChgTypeCd() != null ? pl.getChgTypeCd().name() : null)
                .chgRsn(pl.getChgRsn())
                .regDt(pl.getRegDt())
                .build();
    }
}