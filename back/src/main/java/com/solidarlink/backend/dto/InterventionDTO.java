package com.solidarlink.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InterventionDTO {
    @NotNull(message = "La date d'intervention est obligatoire")
    private LocalDateTime dateIntervention;
    
    @Size(max = 1000, message = "Le message ne peut pas dépasser 1000 caractères")
    private String messageIntervention;
}
