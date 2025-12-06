package com.solidarlink.backend.controller;

import com.solidarlink.backend.dto.StatsDTOs;
import com.solidarlink.backend.entity.CasHumanitaire;
import com.solidarlink.backend.entity.Signalement;
import com.solidarlink.backend.entity.User;
import com.solidarlink.backend.enums.CasStatut;
import com.solidarlink.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')") // Ensure only admins can access
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users/pending")
    public ResponseEntity<List<User>> getPendingUsers() {
        return ResponseEntity.ok(adminService.getPendingUsers());
    }

    @GetMapping("/users/pending/paginated")
    public ResponseEntity<Page<User>> getPendingUsersPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(adminService.getPendingUsersPaginated(pageable));
    }

    @PutMapping("/users/{id}/validate")
    public ResponseEntity<Void> validateUser(@PathVariable Long id) {
        adminService.validateUser(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{id}/reject")
    public ResponseEntity<Void> rejectUser(@PathVariable Long id) {
        adminService.rejectUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/paginated")
    public ResponseEntity<Page<User>> getAllUsersPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(adminService.getAllUsersPaginated(pageable));
    }

    @PutMapping("/users/{id}/ban")
    public ResponseEntity<Void> toggleUserBan(@PathVariable Long id) {
        adminService.toggleUserBan(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/cases")
    public ResponseEntity<List<CasHumanitaire>> getAllCases() {
        return ResponseEntity.ok(adminService.getAllCases());
    }

    @GetMapping("/cases/paginated")
    public ResponseEntity<Page<CasHumanitaire>> getAllCasesPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(adminService.getAllCasesPaginated(pageable));
    }

    @PutMapping("/cases/{id}/status")
    public ResponseEntity<Void> updateCaseStatus(
            @PathVariable Long id,
            @RequestParam CasStatut status) {
        adminService.updateCaseStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/cases/{id}")
    public ResponseEntity<Void> deleteCase(@PathVariable Long id) {
        adminService.deleteCase(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/signalements")
    public ResponseEntity<List<Signalement>> getAllSignalements() {
        return ResponseEntity.ok(adminService.getAllSignalements());
    }

    @PutMapping("/signalements/{id}/close")
    public ResponseEntity<Void> closeSignalement(@PathVariable Long id) {
        adminService.closeSignalement(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<StatsDTOs.AdminStatsDTO> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    private final com.solidarlink.backend.service.ExportService exportService;

    @GetMapping("/reports/cases/pdf")
    public ResponseEntity<org.springframework.core.io.InputStreamResource> exportCasesPdf() {
        java.io.ByteArrayInputStream bis = exportService.exportCasesToPdf();

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=rapport_cases.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(new org.springframework.core.io.InputStreamResource(bis));
    }

    @GetMapping("/reports/cases/csv")
    public ResponseEntity<org.springframework.core.io.InputStreamResource> exportCasesCsv() {
        java.io.ByteArrayInputStream bis = exportService.exportCasesToCsv();

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=rapport_cases.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv"))
                .body(new org.springframework.core.io.InputStreamResource(bis));
    }
}
