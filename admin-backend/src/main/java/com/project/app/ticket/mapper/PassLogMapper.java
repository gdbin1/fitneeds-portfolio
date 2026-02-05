package com.project.app.ticket.mapper;

import com.project.app.ticket.domain.PassLog;
import com.project.app.ticket.dto.PassLogResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PassLogMapper {
    /**
     * 특정 이용권의 전체 변동 이력을 최신순으로 조회합니다.
     */
    List<PassLogResponse> selectPassLogByPassId(Long passId);
    List<PassLog> findAll();
    PassLog findById(@Param("passLogId") Long passLogId);
    int insert(PassLog passlog);
    int update(PassLog passlog);
    int delete(@Param("passLogId") Long passLogId);
}
