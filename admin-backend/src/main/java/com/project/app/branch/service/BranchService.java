package com.project.app.branch.service;

import com.project.app.branch.domain.Branch;
import java.util.List;

public interface BranchService {
    List<Branch> findAll();
    Branch findById(Long brchId);
    Branch create(Branch branch);
    Branch update(Branch branch);
    void delete(Long brchId);
}

