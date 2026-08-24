package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.HomepageStatsResponse;
import com.rtx.placeintel.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/placeintel/api/v1")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/stats/homepage")
    public ResponseEntity<ApiResponse<HomepageStatsResponse>> getHomepageStats() {
        ApiResponse<HomepageStatsResponse> response = statsService.getHomepageStats();

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }
}