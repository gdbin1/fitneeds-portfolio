package com.project.app.sportTypes.controller;

import com.project.app.sportTypes.dto.SportTypeDto.*;
import com.project.app.sportTypes.service.SportTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sport-types")
public class SportTypeController {

    private final SportTypeService sportTypeService;

    @GetMapping
    public ResponseEntity<List<Resp>> list() {
        try {
            List<Resp> result = sportTypeService.list();
            log.info("Successfully retrieved {} sport types", result.size());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error retrieving sport types", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/new")
    public Resp create(@RequestBody @Valid CreateReq req) {
        return sportTypeService.create(req);
    }

    @PutMapping("/{id}")
    public Resp update(@PathVariable Long id, @RequestBody @Valid UpdateReq req) {
        return sportTypeService.update(id, req);
    }

    @PatchMapping("/{id}/deactivate")
    public void deactivate(@PathVariable Long id) {
        sportTypeService.deactivate(id);
    }
}
