package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.CreateTpoRequest;
import com.rtx.placeintel.dto.CreateTpoResponse;
import com.rtx.placeintel.dto.UpdateTpoRequest;
import com.rtx.placeintel.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

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



    @GetMapping("/admin/tpo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CreateTpoResponse>>> getAllTpos() {

        ApiResponse<List<CreateTpoResponse>> response = adminService.getAllTpos();

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }



    @PutMapping("/admin/tpo/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CreateTpoResponse>> updateTpo(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTpoRequest req
    ) {

        ApiResponse<CreateTpoResponse> response = adminService.updateTpo(id, req);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }



    @DeleteMapping("/admin/tpo/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTpo(@PathVariable UUID id) {

        ApiResponse<Void> response = adminService.deleteTpo(id);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }
}