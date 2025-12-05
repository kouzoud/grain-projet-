package com.solidarlink.backend.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

public class InterventionDTOs {

    @Data
    public static class InterventionRequest {
        @NotNull(message = "L'ID du cas est obligatoire")
        private Long casId;

        // Optional if we use AuthenticationPrincipal, but keeping it as per prompt
        // structure if needed.
        // However, for security, we usually ignore this and use the logged-in user.
        // I will include it but Controller might override or use it.
        private Long benevoleId;

        @NotNull(message = "La date d'intervention est obligatoire")
        @Future(message = "La date doit être dans le futur")
        private LocalDateTime dateIntervention;

        private String message;
    }
}
