package com.solidarlink.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.solidarlink.backend.enums.CasCategorie;
import com.solidarlink.backend.enums.CasStatut;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Point;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class CasHumanitaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private CasCategorie categorie;

    @JsonIgnore
    @Column(columnDefinition = "geometry(Point,4326)")
    private Point location;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> photos;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonProperty("statut")
    private CasStatut status = CasStatut.EN_ATTENTE;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    @ManyToOne
    @JoinColumn(name = "volunteer_id")
    private User volunteer;

    @OneToMany(mappedBy = "cas", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Intervention> interventions;

    private LocalDateTime dateIntervention;
    private String messageIntervention;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods for JSON serialization
    public Double getLatitude() {
        if (location != null) {
            return location.getY();
        }
        return null;
    }

    public Double getLongitude() {
        if (location != null) {
            return location.getX();
        }
        return null;
    }
}
