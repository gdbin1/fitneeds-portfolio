package com.project.app.ticket.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserPassUpdateRequest {
    @NotNull(message = "변경할 횟수(rmnCnt)는 필수입니다")
    private Integer rmnCnt; // 변경 후 최종 횟수 (또는 차감/증감분, 정책에 따라 다름)
    
    private String memo;    // 변경 사유 (ex: "전산 오류로 인한 2회 보상 지급")
}

