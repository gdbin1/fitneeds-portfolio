package com.project.app.branch.mapper;

import com.project.app.branch.domain.Branch;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BranchMapper {
    List<Branch> findAll();
    Branch findById(@Param("brchId") Long brchId);
    int insert(Branch branch);
    int update(Branch branch);
    int delete(@Param("brchId") Long brchId);
    int deleteBranchInfoByBrchId(@Param("brchId") Long brchId);
    int deleteAdminUsersByBrchId(@Param("brchId") String brchId);
    int deleteAdminUsersByBrchIdLong(@Param("brchId") Long brchId);
    String findMaxBrchIdByYear(@Param("year") String year);
    Long findMaxBrchId();
}

