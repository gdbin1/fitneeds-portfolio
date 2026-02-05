package com.project.app.branch.service;

import com.project.app.branch.domain.BranchInfo;
import java.util.List;

public interface BranchInfoService {
    List<BranchInfo> findAll();
    BranchInfo findById(Long brInfoId);
    BranchInfo create(BranchInfo branchinfo);
    BranchInfo update(BranchInfo branchinfo);
    void delete(Long brInfoId);
}


