// Fixed @PathVariable name issue
package com.project.app.branch.controller;

import com.project.app.branch.domain.Branch;
import com.project.app.branch.service.BranchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branch")
@RequiredArgsConstructor
public class BranchController {
    
    private final BranchService branchService;
    
    @GetMapping
    public ResponseEntity<List<Branch>> findAll() {
        return ResponseEntity.ok(branchService.findAll());
    }
    
    @GetMapping("/{brchId}")
    public ResponseEntity<?> findById(@PathVariable("brchId") Long brchId) {
        try {
            System.out.println("GET request for branch ID: " + brchId);
            Branch branch = branchService.findById(brchId);
            if (branch == null) {
                System.out.println("Branch not found for ID: " + brchId);
                return ResponseEntity.notFound().build();
            }
            System.out.println("Found branch: " + branch);
            return ResponseEntity.ok(branch);
        } catch (Exception e) {
            System.err.println("Error in findById: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }
    
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Branch branch) {
        try {
            System.out.println("Create request - Branch: " + branch);
            
            // 필수 필드 검증
            if (branch.getBrchNm() == null || branch.getBrchNm().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Branch name is required");
            }
            if (branch.getAddr() == null || branch.getAddr().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Address is required");
            }
            if (branch.getOperYn() == null) {
                branch.setOperYn(1); // 기본값 설정
            }
            
            Branch created = branchService.create(branch);
            System.out.println("Created branch: " + created);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            System.err.println("Error creating branch: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create branch: " + e.getMessage());
        }
    }
    
    @PutMapping("/{brchId}")
    public ResponseEntity<?> update(@PathVariable("brchId") Long brchId, @RequestBody Branch branch) {
        try {
            System.out.println("Update request - brchId: " + brchId);
            System.out.println("Branch object: " + branch);
            
            // Set ID from path variable
            branch.setBrchId(brchId);
            
            // 필수 필드 검증
            if (branch.getBrchNm() == null || branch.getBrchNm().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Branch name is required");
            }
            if (branch.getAddr() == null || branch.getAddr().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Address is required");
            }
            if (branch.getOperYn() == null) {
                branch.setOperYn(1); // 기본값 설정
            }
            
            Branch updated = branchService.update(branch);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            System.err.println("Error updating branch: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update branch: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{brchId}")
    public ResponseEntity<?> delete(@PathVariable("brchId") Long brchId) {
        try {
            branchService.delete(brchId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete branch: " + e.getMessage());
        }
    }
}
