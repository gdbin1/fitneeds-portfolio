package com.project.app.branch.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * BranchInfo 도메인 클래스
 * branch_info 테이블과 매핑
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BranchInfo {
    private Long brInfoId;
    private Long brchId;
    
    // 날짜와 시간을 문자열로 받아 호환성 문제 해결
    private String openTime;
    private String closeTime;
    private String breakStartTime;
    private String breakEndTime;    
    private String holidayInfo;
    private String policyInfo;    
    private String creatAt;
    private String updAt;
}


