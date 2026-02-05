// file: src/main/java/com/project/app/myclass/controller/MyClassController.java
package com.project.app.myclass.controller;

import com.project.app.myclass.dto.MyClassDto;
import com.project.app.myclass.dto.ScheduleListQuery;
import com.project.app.myclass.service.MyClassService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/myclass")
public class MyClassController {

    private final MyClassService myClassService;

    @GetMapping("/schedules")
    public ResponseEntity<?> listSchedules(
            Authentication authentication,
            @Valid ScheduleListQuery q
    ) {
        try {
            String requesterId = requireRequester(authentication);
            if (q.getPage() != null || q.getSize() != null) {
                return ResponseEntity.ok(myClassService.listSchedulesPaged(requesterId, q));
            }
            return ResponseEntity.ok(myClassService.listSchedules(requesterId, q));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error listing myclass schedules", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/schedules/{schdId}")
    public ResponseEntity<MyClassDto.ScheduleResp> getSchedule(
            Authentication authentication,
            @PathVariable Long schdId
    ) {
        try {
            String requesterId = requireRequester(authentication);
            return ResponseEntity.ok(myClassService.getSchedule(requesterId, schdId));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Error getting myclass schedule", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/schedules/{schdId}/reservations")
    public ResponseEntity<List<MyClassDto.ReservationResp>> getReservations(
            Authentication authentication,
            @PathVariable Long schdId
    ) {
        try {
            String requesterId = requireRequester(authentication);
            return ResponseEntity.ok(myClassService.getReservations(requesterId, schdId));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Error getting reservations by schedule", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 인증 userId 추출 (너희 프로젝트에서 sub == userId 전제)
    private String requireRequester(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new AccessDeniedException("Unauthenticated");
        }
        return authentication.getName();
    }
}
