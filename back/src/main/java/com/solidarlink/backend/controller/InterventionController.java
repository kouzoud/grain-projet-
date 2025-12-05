package com.solidarlink.backend.controller;

import com.solidarlink.backend.dto.InterventionDTOs;
import com.solidarlink.backend.service.InterventionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/interventions")
@RequiredArgsConstructor
public class InterventionController {

    private final InterventionService interventionService;

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmIntervention(
            @Valid @RequestBody InterventionDTOs.InterventionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        interventionService.confirmIntervention(request, userDetails.getUsername());
        return ResponseEntity.ok().body("{\"message\": \"Intervention confirmée avec succès\"}");
    }
}
