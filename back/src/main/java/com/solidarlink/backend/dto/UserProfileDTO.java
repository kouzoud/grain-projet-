package com.solidarlink.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileDTO {
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String competences;
    private String disponibilite;
    private String avatarUrl;
}
