// Fixed @PathVariable name issue
package com.project.app.branch.controller;

import com.project.app.branch.domain.BranchInfo;
import com.project.app.branch.service.BranchInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branch-info")
@RequiredArgsConstructor
public class BranchInfoController {
    
    private final BranchInfoService branchinfoService;
    
    @GetMapping
    public ResponseEntity<List<BranchInfo>> findAll() {
        return ResponseEntity.ok(branchinfoService.findAll());
    }
    
    @GetMapping("/{brInfoId}")
    public ResponseEntity<BranchInfo> findById(@PathVariable("brInfoId") Long brInfoId) {
        BranchInfo branchinfo = branchinfoService.findById(brInfoId);
        if (branchinfo == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(branchinfo);
    }
    
    @PostMapping
    public ResponseEntity<BranchInfo> create(@RequestBody BranchInfo branchinfo) {
        return ResponseEntity.ok(branchinfoService.create(branchinfo));
    }
    
    @PutMapping("/{brInfoId}")
    public ResponseEntity<?> update(@PathVariable("brInfoId") Long brInfoId, @RequestBody BranchInfo branchinfo) {
        try {
            System.out.println("PUT request for branch-info ID: " + brInfoId);
            System.out.println("Received branchinfo object: " + branchinfo);
            
            if (brInfoId == null) {
                return ResponseEntity.badRequest().body("Path variable brInfoId is missing");
            }
            
            // Set ID from path variable
            branchinfo.setBrInfoId(brInfoId);
            BranchInfo updated = branchinfoService.update(branchinfo);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            System.err.println("Controller error during update: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{brInfoId}")
    public ResponseEntity<Void> delete(@PathVariable("brInfoId") Long brInfoId) {
        branchinfoService.delete(brInfoId);
        return ResponseEntity.ok().build();
    }
}
