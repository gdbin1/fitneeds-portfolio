package com.project.app.userpass.dto;

import com.project.app.userpass.entity.UserPass;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MyPassSummaryDto {
    private Long userPassId;
    private Long sportId;
    private String sportName;
    private Integer rmnCnt;
    private Integer initCnt;
    private String passStatusCd;
    private Long lstProdId;

    public static MyPassSummaryDto of(UserPass up) {
        return MyPassSummaryDto.builder()
                .userPassId(up.getUserPassId())
                .sportId(up.getSportType() != null ? up.getSportType().getSportId() : null)
                .sportName(up.getSportType() != null ? up.getSportType().getSportNm() : null)
                .rmnCnt(up.getRmnCnt())
                .initCnt(up.getInitCnt())
                .passStatusCd(up.getPassStatusCd() != null ? up.getPassStatusCd().name() : null)
                .lstProdId(up.getLstProdId())
                .build();
    }
}

