package com.project.app.branch.service;

import com.project.app.branch.domain.Branch;
import com.project.app.branch.mapper.BranchMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BranchServiceImpl implements BranchService {
    
    private final BranchMapper branchMapper;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    @Override
    public List<Branch> findAll() {
        try {
            System.out.println("Finding all branches...");
            List<Branch> branches = branchMapper.findAll();
            System.out.println("Found " + (branches != null ? branches.size() : 0) + " branches");
            return branches;
        } catch (Exception e) {
            System.err.println("Error in findAll: " + e.getMessage());
            throw new RuntimeException("Failed to find all branches: " + e.getMessage(), e);
        }
    }
    
    @Override
    public Branch findById(Long brchId) {
        try {
            System.out.println("Service: Finding branch by ID: " + brchId);
            Branch branch = branchMapper.findById(brchId);
            System.out.println("Service: Found branch: " + branch);
            return branch;
        } catch (Exception e) {
            System.err.println("Service error in findById: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Branch ID 자동 생성: 최대값 + 1
     */
    private Long generateBranchId() {
        try {
            System.out.println("Generating branch ID...");
            Long maxBrchId = branchMapper.findMaxBrchId();
            return (maxBrchId != null) ? maxBrchId + 1 : 1L;
        } catch (Exception e) {
            System.err.println("Error generating branch ID: " + e.getMessage());
            return 1L;
        }
    }
    
    @Override
    public Branch create(Branch branch) {
        try {
            System.out.println("Creating branch: " + branch);
            
            // 필수 필드 검증
            if (branch.getBrchNm() == null || branch.getBrchNm().trim().isEmpty()) {
                throw new IllegalArgumentException("Branch name is required");
            }
            if (branch.getAddr() == null || branch.getAddr().trim().isEmpty()) {
                throw new IllegalArgumentException("Address is required");
            }
            if (branch.getOperYn() == null) {
                branch.setOperYn(1); // 기본값 설정
            }
            
            // ID 자동 생성
            branch.setBrchId(generateBranchId());
            
            // 등록일과 수정일 설정
            String now = LocalDateTime.now().format(DATE_TIME_FORMATTER);
            branch.setRegDt(now);
            branch.setUpdDt(now);
            
            int inserted = branchMapper.insert(branch);
            System.out.println("Inserted rows: " + inserted);
            
            return branchMapper.findById(branch.getBrchId());
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error in create method: " + e.getMessage());
            throw new RuntimeException("Failed to create branch: " + e.getMessage(), e);
        }
    }
    
    @Override
    public Branch update(Branch branch) {
        // 필수 필드 검증
        if (branch.getBrchId() == null) {
            throw new IllegalArgumentException("Branch ID is required");
        }
        
        if (branch.getBrchNm() == null || branch.getBrchNm().trim().isEmpty()) {
            throw new IllegalArgumentException("Branch name is required");
        }
        
        // 수정일 설정
        branch.setUpdDt(LocalDateTime.now().format(DATE_TIME_FORMATTER));
        
        int updated = branchMapper.update(branch);
        if (updated == 0) {
            throw new RuntimeException("Branch with id " + branch.getBrchId() + " not found");
        }
        return branchMapper.findById(branch.getBrchId());
    }
    
    @Override
    public void delete(Long brchId) {
        try {
            // 외래키 제약조건을 해결하기 위해 관련 데이터를 먼저 삭제
            branchMapper.deleteBranchInfoByBrchId(brchId);
            branchMapper.deleteAdminUsersByBrchIdLong(brchId);
            
            // 마지막으로 branch 삭제
            int deleted = branchMapper.delete(brchId);
            if (deleted == 0) {
                throw new RuntimeException("Branch with id " + brchId + " not found");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete branch: " + e.getMessage(), e);
        }
    }
}
