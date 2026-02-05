package com.project.app.pass.service;

import com.project.app.userpass.entity.PassLog;
import com.project.app.userpass.repository.PassLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * [PASS - 조회 전용 서비스]
 * ✔ 로그 조회만 담당
 * ❌ 생성/변경 없음
 */
@Service
@RequiredArgsConstructor
public class PassLogQueryService {

    private final PassLogRepository passLogRepository;

    @Transactional(readOnly = true)
    public List<PassLog> getPassLogsByUserId(String userId) {
        return passLogRepository
                .findByUserPass_User_UserIdOrderByRegDtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<PassLog> getPassLogsByUserPassId(Long userPassId) {
        return passLogRepository
                .findByUserPass_UserPassIdOrderByRegDtDesc(userPassId);
    }
}


