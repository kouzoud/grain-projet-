package com.solidarlink.backend.controller;

import com.solidarlink.backend.dto.CasHumanitaireDTO;
import com.solidarlink.backend.dto.InterventionDTO;
import com.solidarlink.backend.entity.CasHumanitaire;
import com.solidarlink.backend.entity.User;
import com.solidarlink.backend.enums.CasCategorie;
import com.solidarlink.backend.enums.CasStatut;
import com.solidarlink.backend.service.CasHumanitaireService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
@Tag(name = "Cas Humanitaires", description = "Gestion des cas humanitaires et interventions")
@SecurityRequirement(name = "Bearer Authentication")
public class CasHumanitaireController {

    private final CasHumanitaireService casService;

    @Operation(
            summary = "Créer un nouveau cas humanitaire",
            description = "Permet à un citoyen de signaler un cas humanitaire avec photos et localisation"
    )
    @ApiResponse(responseCode = "200", description = "Cas créé avec succès")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CasHumanitaire> createCase(
            @jakarta.validation.Valid @ModelAttribute CasHumanitaireDTO request,
            @AuthenticationPrincipal User user) throws IOException {
        return ResponseEntity.ok(casService.createCase(request, user));
    }

    @Operation(
            summary = "Mettre à jour un cas humanitaire",
            description = "Permet à l'auteur de modifier son cas"
    )
    @PostMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CasHumanitaire> updateCase(
            @Parameter(description = "ID du cas à modifier") @PathVariable Long id,
            @jakarta.validation.Valid @ModelAttribute CasHumanitaireDTO request,
            @AuthenticationPrincipal User user) throws IOException {
        return ResponseEntity.ok(casService.updateCase(id, request, user));
    }

    @Operation(summary = "Supprimer un cas humanitaire")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCase(
            @Parameter(description = "ID du cas à supprimer") @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        casService.deleteCase(id, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<CasHumanitaire>> getAllCases() {
        return ResponseEntity.ok(casService.getAllCases());
    }

    // ========== PAGINATED ENDPOINTS (NEW) ==========
    @GetMapping("/paginated")
    public ResponseEntity<Page<CasHumanitaire>> getAllCasesPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) CasStatut status,
            @RequestParam(required = false) CasCategorie categorie,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<CasHumanitaire> result;
        if (status != null && categorie != null) {
            result = casService.getCasesByStatusAndCategorie(status, categorie, pageable);
        } else if (status != null) {
            result = casService.getCasesByStatus(status, pageable);
        } else if (categorie != null) {
            result = casService.getCasesByCategorie(categorie, pageable);
        } else {
            result = casService.getAllCasesPaginated(pageable);
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/viewport")
    public ResponseEntity<Page<CasHumanitaire>> getCasesInViewport(
            @RequestParam double minLon,
            @RequestParam double minLat,
            @RequestParam double maxLon,
            @RequestParam double maxLat,
            @RequestParam(required = false) CasStatut status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CasHumanitaire> result = casService.getCasesWithinViewport(minLon, minLat, maxLon, maxLat, status, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/me")
    public ResponseEntity<List<CasHumanitaire>> getMyCases(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(casService.getMyCases(user));
    }

    @GetMapping("/me/paginated")
    public ResponseEntity<Page<CasHumanitaire>> getMyCasesPaginated(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(casService.getMyCasesPaginated(user, pageable));
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

    @GetMapping("/my-interventions/paginated")
    public ResponseEntity<Page<CasHumanitaire>> getMyInterventionsPaginated(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return ResponseEntity.ok(casService.getMyInterventionsPaginated(user, pageable));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<CasHumanitaire> resolveCase(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(casService.resolveCase(id, user));
    }
}
