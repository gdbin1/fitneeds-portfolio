package com.project.app.branch.dto;

import java.time.LocalDateTime;

import com.project.app.branch.entity.Branch;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BranchResponseDto {

    private Long brchId;
    private String brchNm;
    private String addr;
    private boolean operYn;
    private LocalDateTime regDt;
    private LocalDateTime updDt;

    /**
     * Entity -> DTO 변환 (정적 팩토리 메서드)
     */
    public static BranchResponseDto from (Branch branch) {
        if (branch == null) return null;

        return BranchResponseDto.builder()
                .brchId(branch.getBrchId())
                .brchNm(branch.getBrchNm())
                .addr(branch.getAddr())
                .operYn(branch.isOperYn())
                .regDt(branch.getRegDt())
                .updDt(branch.getUpdDt())
                .build();
    }
}