package com.project.app.ticket.repository;

import com.project.app.ticket.entity.PassLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PassLogRepository extends JpaRepository<PassLog, Long> {

    /**
     * 특정 이용권의 로그 조회
     */
    List<PassLog> findByUserPass_PassId(Long passId);

    /**
     * 특정 타입의 로그 조회
     */
    List<PassLog> findByChgTypeCd(String changeTypeCode);
}

