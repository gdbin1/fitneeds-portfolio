// Fixed @PathVariable name issue
package com.project.app.program.controller;

import com.project.app.program.domain.Program;
import com.project.app.program.service.ProgramService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/program")
@RequiredArgsConstructor
public class ProgramController {
    
    private final ProgramService programService;
    
    @GetMapping
    public ResponseEntity<List<Program>> findAll() {
        return ResponseEntity.ok(programService.findAll());
    }
    
    @GetMapping("/{progId}")
    public ResponseEntity<Program> findById(@PathVariable("progId") Long progId) {
        Program program = programService.findById(progId);
        if (program == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(program);
    }
    
    @PostMapping
    public ResponseEntity<Program> create(@RequestBody Program program) {
        return ResponseEntity.ok(programService.create(program));
    }
    
    @PutMapping("/{progId}")
    public ResponseEntity<Program> update(@PathVariable("progId") Long progId, @RequestBody Program program) {
        program.setProgId(progId);
        return ResponseEntity.ok(programService.update(program));
    }
    
    @DeleteMapping("/{progId}")
    public ResponseEntity<Void> delete(@PathVariable("progId") Long progId) {
        try {
            Program program = programService.findById(progId);
            if (program == null) {
                log.warn("Program not found with id: {}", progId);
                return ResponseEntity.notFound().build();
            }
            
            programService.delete(progId);
            log.info("Successfully deleted program with id: {}", progId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("Invalid argument for deleting program: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error deleting program with id: {}", progId, e);
            // 외래키 제약조건 에러인지 확인
            String errorMessage = e.getMessage();
            if (errorMessage != null && (errorMessage.contains("foreign key") || 
                                         errorMessage.contains("cannot delete") ||
                                         errorMessage.contains("constraint"))) {
                log.warn("Cannot delete program {} due to foreign key constraint", progId);
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
