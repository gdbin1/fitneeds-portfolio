package com.project.app.userpass.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.app.userpass.dto.MyPassSummaryDto;
import com.project.app.userpass.dto.PassDetailDto;
import com.project.app.userpass.service.MyPassService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MyPassController {

    private final MyPassService myPassService;

    // GET /api/my-pass?userId={userId}
    @GetMapping("/my-pass")
    public ResponseEntity<List<MyPassSummaryDto>> getMyPasses(@RequestParam("userId") String userId) {
        return ResponseEntity.ok(myPassService.getCurrentPasses(userId));
    }

    // GET /api/my-pass/{id}
    @GetMapping("/my-pass/{id}")
    public ResponseEntity<PassDetailDto> getMyPassDetail(@PathVariable("id") Long id) {
        return ResponseEntity.ok(myPassService.getPassDetail(id));
    }
}

