package com.solidarlink.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
// Entity for managing interventions
public class Intervention {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cas_id", nullable = false)
    private CasHumanitaire cas;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "benevole_id", nullable = false)
    private User benevole;

    @Column(nullable = false)
    private LocalDateTime dateIntervention;

    @Column(length = 1000)
    private String message;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
