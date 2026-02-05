package com.project.app.branch.service;

import com.project.app.branch.domain.BranchInfo;
import com.project.app.branch.mapper.BranchInfoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BranchInfoServiceImpl implements BranchInfoService {
    
    private final BranchInfoMapper branchinfoMapper;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    @Override
    public List<BranchInfo> findAll() {
        return branchinfoMapper.findAll();
    }
    
    @Override
    public BranchInfo findById(Long brInfoId) {
        return branchinfoMapper.findById(brInfoId);
    }
    
    @Override
    public BranchInfo create(BranchInfo branchinfo) {
        try {
            System.out.println("Creating branch info: " + branchinfo);
            // 등록일과 수정일 설정
            String now = LocalDateTime.now().format(DATE_TIME_FORMATTER);
            branchinfo.setCreatAt(now);
            branchinfo.setUpdAt(now);
            
            branchinfoMapper.insert(branchinfo);
            return branchinfoMapper.findById(branchinfo.getBrInfoId());
        } catch (Exception e) {
            System.err.println("Error creating branch info: " + e.getMessage());
            throw e;
        }
    }
    
    @Override
    public BranchInfo update(BranchInfo branchinfo) {
        try {
            if (branchinfo == null || branchinfo.getBrInfoId() == null) {
                throw new IllegalArgumentException("Branch info or ID cannot be null");
            }
            
            System.out.println("Updating branch info: " + branchinfo);
            // 수정일 설정
            branchinfo.setUpdAt(LocalDateTime.now().format(DATE_TIME_FORMATTER));
            
            int updated = branchinfoMapper.update(branchinfo);
            System.out.println("Update result: " + updated + " rows affected");
            
            if (updated == 0) {
                // 혹시 모르니 다시 한번 존재 여부 확인
                BranchInfo existing = branchinfoMapper.findById(branchinfo.getBrInfoId());
                if (existing == null) {
                    throw new RuntimeException("Branch info with id " + branchinfo.getBrInfoId() + " not found in database");
                }
                // 존재하는데 업데이트가 안 된 경우 (값이 같거나 다른 이슈)
                System.out.println("Warning: Update affected 0 rows, but record exists.");
            }
            
            BranchInfo result = branchinfoMapper.findById(branchinfo.getBrInfoId());
            System.out.println("Update completed successfully. Returning result: " + result);
            return result;
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR updating branch info: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error updating branch info: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void delete(Long brInfoId) {
        branchinfoMapper.delete(brInfoId);
    }
}


