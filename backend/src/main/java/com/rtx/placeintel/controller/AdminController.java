package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.CreateTpoRequest;
import com.rtx.placeintel.dto.CreateTpoResponse;
import com.rtx.placeintel.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/placeintel/api/v1")
@RequiredArgsConstructor
public class AdminController {



    private final AdminService adminService;



    @PostMapping("/admin/tpo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CreateTpoResponse>> createTpo(@Valid @RequestBody CreateTpoRequest req) {

        ApiResponse<CreateTpoResponse> response = adminService.createTpo(req);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}