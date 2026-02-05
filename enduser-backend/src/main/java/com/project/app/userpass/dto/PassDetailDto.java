package com.project.app.userpass.dto;

import com.project.app.userpass.entity.PassLog;
import com.project.app.userpass.entity.UserPass;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class PassDetailDto {
    private Long userPassId;
    private Long sportId;
    private String sportName;
    private Integer rmnCnt;
    private Integer initCnt;
    private String passStatusCd;
    private List<PassLogResponseDto> recentLogs;

    public static PassDetailDto of(UserPass up, List<PassLog> logs) {
        return PassDetailDto.builder()
                .userPassId(up.getUserPassId())
                .sportId(up.getSportType() != null ? up.getSportType().getSportId() : null)
                .sportName(up.getSportType() != null ? up.getSportType().getSportNm() : null)
                .rmnCnt(up.getRmnCnt())
                .initCnt(up.getInitCnt())
                .passStatusCd(up.getPassStatusCd() != null ? up.getPassStatusCd().name() : null)
                .recentLogs(logs.stream().map(PassLogResponseDto::of).collect(Collectors.toList()))
                .build();
    }
}

