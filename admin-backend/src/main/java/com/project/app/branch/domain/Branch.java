package com.project.app.branch.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Branch 도메인 클래스
 * branch 테이블과 매핑
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Branch {
    private Long brchId;
    private String brchNm;
    private String addr;
    private String phone;
    private Integer operYn;    
    private String regDt;
    private String updDt;
}
