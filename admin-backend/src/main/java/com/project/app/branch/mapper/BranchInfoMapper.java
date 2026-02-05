package com.project.app.branch.mapper;

import com.project.app.branch.domain.BranchInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BranchInfoMapper {
    List<BranchInfo> findAll();
    BranchInfo findById(@Param("brInfoId") Long brInfoId);
    int insert(BranchInfo branchinfo);
    int update(BranchInfo branchinfo);
    int delete(@Param("brInfoId") Long brInfoId);
    int deleteByBrchId(@Param("brchId") Long brchId);
}


