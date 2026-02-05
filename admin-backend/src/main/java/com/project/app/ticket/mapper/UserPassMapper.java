package com.project.app.ticket.mapper;

import com.project.app.ticket.dto.UserPassResponse;
import com.project.app.ticket.dto.UserPassSearchRequest;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface UserPassMapper {
    // 1. 검색 조건에 맞는 이용권 목록 조회
    List<UserPassResponse> selectTicketList(UserPassSearchRequest searchDto);

    // 2. 페이징을 위한 전체 개수 조회
    int countTicketList(UserPassSearchRequest searchDto);
}

