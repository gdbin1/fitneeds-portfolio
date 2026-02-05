package com.project.app.userpass.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.app.userpass.entity.PassLog;

import java.util.List;

@Repository
public interface PassLogRepository extends JpaRepository<PassLog, Long> {

    // 사용자 기준 로그 조회
    List<PassLog> findByUserPass_User_UserIdOrderByRegDtDesc(String userId);

    // 이용권 기준 로그 조회
    List<PassLog> findByUserPass_UserPassIdOrderByRegDtDesc(Long userPassId);
}
