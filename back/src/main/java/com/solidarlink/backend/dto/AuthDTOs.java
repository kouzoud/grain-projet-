package com.solidarlink.backend.dto;

import com.solidarlink.backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDTOs {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RegisterRequest {
        @jakarta.validation.constraints.NotBlank(message = "Le nom est obligatoire")
        private String nom;

        @jakarta.validation.constraints.NotBlank(message = "Le prénom est obligatoire")
        private String prenom;

        @jakarta.validation.constraints.NotBlank(message = "L'email est obligatoire")
        @jakarta.validation.constraints.Email(message = "Email invalide")
        private String email;

        @jakarta.validation.constraints.NotBlank(message = "Le mot de passe est obligatoire")
        @jakarta.validation.constraints.Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
        @jakarta.validation.constraints.Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", message = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial")
        private String password;

        @jakarta.validation.constraints.Pattern(regexp = "^(0[1-9])[0-9]{8}$", message = "Format téléphone invalide (ex: 0612345678)")
        private String telephone;

        @jakarta.validation.constraints.NotNull(message = "Le rôle est obligatoire")
        private Role role;

        private String competences;
        private String disponibilite;
        private String zoneAction;
        private String documentUrl;
        private String documentType;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AuthenticationRequest {
        @jakarta.validation.constraints.NotBlank(message = "L'email est obligatoire")
        @jakarta.validation.constraints.Email(message = "Email invalide")
        private String email;
        
        @jakarta.validation.constraints.NotBlank(message = "Le mot de passe est obligatoire")
        private String password;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AuthenticationResponse {
        private String token;
        private String role;
        private String nom;
        private String prenom;
    }
}
