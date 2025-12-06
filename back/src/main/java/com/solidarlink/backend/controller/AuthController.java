package com.solidarlink.backend.controller;

import com.solidarlink.backend.dto.AuthDTOs;
import com.solidarlink.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "Endpoints pour l'inscription, la connexion et l'upload de documents")
public class AuthController {

    private final AuthService authService;

    @Operation(
            summary = "Inscription d'un nouvel utilisateur",
            description = "Permet à un utilisateur (citoyen, bénévole ou admin) de créer un compte"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Inscription réussie",
                    content = @Content(schema = @Schema(implementation = AuthDTOs.AuthenticationResponse.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    @PostMapping("/auth/register")
    public ResponseEntity<AuthDTOs.AuthenticationResponse> register(
            @jakarta.validation.Valid @RequestBody AuthDTOs.RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @Operation(
            summary = "Connexion d'un utilisateur",
            description = "Authentifie un utilisateur et retourne un token JWT"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Connexion réussie",
                    content = @Content(schema = @Schema(implementation = AuthDTOs.AuthenticationResponse.class))),
            @ApiResponse(responseCode = "401", description = "Identifiants invalides")
    })
    @PostMapping("/auth/login")
    public ResponseEntity<AuthDTOs.AuthenticationResponse> login(
            @jakarta.validation.Valid @RequestBody AuthDTOs.AuthenticationRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/uploads")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(authService.saveFile(file));
    }
}
