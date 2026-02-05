// Fixed @PathVariable name issue
package com.project.app.schedule.controller;

import com.project.app.schedule.domain.Schedule;
import com.project.app.schedule.dto.ScheduleCalendarResponseDto;
import com.project.app.schedule.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
@Slf4j
public class ScheduleController {
    
    private final ScheduleService scheduleService;
    
    @GetMapping
    public ResponseEntity<List<Schedule>> findAll() {
        return ResponseEntity.ok(scheduleService.findAll());
    }
    
    @GetMapping("/{schdId}")
    public ResponseEntity<Schedule> findById(@PathVariable("schdId") Long schdId) {
        Schedule schedule = scheduleService.findById(schdId);
        if (schedule == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(schedule);
    }
    
    @GetMapping("/calendar")
    public ResponseEntity<List<ScheduleCalendarResponseDto>> selectCalendarSchedules(
    		@RequestParam("fromDt") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDt,
    		@RequestParam("toDt") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDt,
    		@RequestParam(value = "brchId", required = false) Long brchId
    		) {
    	return ResponseEntity.ok(scheduleService.selectCalendarSchedules(fromDt, toDt, brchId));
    }
    
    @GetMapping("/{brchId}/branch")
    public ResponseEntity<List<Schedule>> findByBrchId(@PathVariable("brchId") Long brchId) {
    	List<Schedule> schedule = scheduleService.findByBrchId(brchId);
    	
    	return ResponseEntity.ok(schedule);    	
    }
    
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Schedule schedule) {
        log.info("Request to create schedule: {}", schedule);
        try {
            Schedule created = scheduleService.create(schedule);
            log.info("Schedule created successfully: {}", created);
            return ResponseEntity.ok(created);
        } catch (IllegalStateException e) {
            log.warn("Duplicate schedule error: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "DUPLICATE_SCHEDULE");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (Exception e) {
            log.error("Error creating schedule", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "INTERNAL_SERVER_ERROR");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PutMapping("/{schdId}")
    public ResponseEntity<?> update(@PathVariable("schdId") Long schdId, @RequestBody Schedule schedule) {
        log.info("Request to update schedule {}: {}", schdId, schedule);
        try {
            schedule.setSchdId(schdId);
            Schedule updated = scheduleService.update(schedule);
            log.info("Schedule updated successfully: {}", updated);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            log.warn("Duplicate schedule error: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "DUPLICATE_SCHEDULE");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (Exception e) {
            log.error("Error updating schedule", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "INTERNAL_SERVER_ERROR");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @DeleteMapping("/{schdId}")
    public ResponseEntity<Void> delete(@PathVariable("schdId") Long schdId) {
        log.info("Request to delete schedule: {}", schdId);
        scheduleService.delete(schdId);
        return ResponseEntity.ok().build();
    }
}
