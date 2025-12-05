package com.solidarlink.backend.controller;

import com.solidarlink.backend.dto.StatsDTOs;
import com.solidarlink.backend.service.PublicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final PublicService publicService;

    @GetMapping("/stats")
    public ResponseEntity<StatsDTOs.PublicStatsDTO> getStats() {
        return ResponseEntity.ok(publicService.getStats());
    }

    @GetMapping("/stats/impact")
    public ResponseEntity<StatsDTOs.ImpactStatsDTO> getImpactStats() {
        return ResponseEntity.ok(publicService.getImpactStats());
    }

    @GetMapping("/cases/resolved")
    public ResponseEntity<java.util.List<com.solidarlink.backend.dto.CasHumanitaireDTO>> getLatestResolvedCases() {
        return ResponseEntity.ok(publicService.getLatestResolvedCases());
    }
}
