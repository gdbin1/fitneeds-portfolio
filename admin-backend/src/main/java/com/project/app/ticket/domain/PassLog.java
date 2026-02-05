package com.project.app.ticket.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.project.app.ticket.entity.PassLogChgTypeCd;

/**
 * PassLog 도메인 클래스
 * pass_log 테이블과 매핑
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PassLog {
    @JsonProperty("pass_log_id")
    private Long passLogId;

    @JsonProperty("user_pass_id")
    private Long userPassId;

    @JsonProperty("brch_id")
    private Long brchId;

    @JsonProperty("chg_type_cd")
    private PassLogChgTypeCd chgTypeCd;

    @JsonProperty("chg_cnt")
    private Integer chgCnt;

    @JsonProperty("chg_rsn")
    private String chgRsn;

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("reg_dt")
    private String regDt;
}
