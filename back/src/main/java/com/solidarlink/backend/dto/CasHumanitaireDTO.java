package com.solidarlink.backend.dto;

import com.solidarlink.backend.enums.CasCategorie;
import com.solidarlink.backend.enums.CasStatut;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CasHumanitaireDTO {
    private Long id;
    private String titre;
    private String description;
    private CasCategorie categorie;
    private CasStatut statut;
    private Double latitude;
    private Double longitude;
    private List<MultipartFile> photos;
    private List<String> existingPhotos;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
