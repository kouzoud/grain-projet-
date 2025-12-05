package com.solidarlink.backend.controller;

import com.solidarlink.backend.dto.CasHumanitaireDTO;
import com.solidarlink.backend.dto.InterventionDTO;
import com.solidarlink.backend.entity.CasHumanitaire;
import com.solidarlink.backend.entity.User;
import com.solidarlink.backend.service.CasHumanitaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
public class CasHumanitaireController {

    private final CasHumanitaireService casService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CasHumanitaire> createCase(
            @ModelAttribute CasHumanitaireDTO request,
            @AuthenticationPrincipal User user) throws IOException {
        return ResponseEntity.ok(casService.createCase(request, user));
    }

    @PostMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CasHumanitaire> updateCase(
            @PathVariable Long id,
            @ModelAttribute CasHumanitaireDTO request,
            @AuthenticationPrincipal User user) throws IOException {
        return ResponseEntity.ok(casService.updateCase(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCase(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        casService.deleteCase(id, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<CasHumanitaire>> getAllCases() {
        return ResponseEntity.ok(casService.getAllCases());
    }

    @GetMapping("/me")
    public ResponseEntity<List<CasHumanitaire>> getMyCases(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(casService.getMyCases(user));
    }

    @GetMapping("/validated")
    public ResponseEntity<List<CasHumanitaire>> getValidatedCases() {
        return ResponseEntity.ok(casService.getValidatedCases());
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<CasHumanitaire>> getNearbyCases(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam double radius,
            @RequestParam(required = false) String categorie) {
        // Category filtering can be added to service if needed, currently just location
        return ResponseEntity.ok(casService.getNearbyCases(latitude, longitude, radius));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CasHumanitaire> getCaseById(@PathVariable Long id) {
        return ResponseEntity.ok(casService.getCaseById(id));
    }

    @PutMapping("/{id}/take")
    public ResponseEntity<CasHumanitaire> takeCase(
            @PathVariable Long id,
            @RequestBody InterventionDTO intervention,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(casService.takeCase(id, intervention, user));
    }

    @GetMapping("/my-interventions")
    public ResponseEntity<List<CasHumanitaire>> getMyInterventions(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(casService.getMyInterventions(user));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<CasHumanitaire> resolveCase(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(casService.resolveCase(id, user));
    }
}
