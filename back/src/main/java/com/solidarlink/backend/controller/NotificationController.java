package com.solidarlink.backend.controller;

import com.solidarlink.backend.config.JwtService;
import com.solidarlink.backend.entity.User;
import com.solidarlink.backend.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Contrôleur pour les notifications en temps réel
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notifications en temps réel via Server-Sent Events")
@SecurityRequirement(name = "Bearer Authentication")
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtService jwtService;

    @Operation(
            summary = "Se connecter au flux de notifications",
            description = "Établit une connexion SSE pour recevoir des notifications en temps réel. " +
                         "Le token JWT peut être passé soit dans le header Authorization, soit dans le paramètre 'token' de l'URL."
    )
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(
            @AuthenticationPrincipal(errorOnInvalidType = false) User user,
            @RequestParam(value = "token", required = false) String tokenParam) {
        
        // Si l'utilisateur n'est pas authentifié via header, essayer avec le token de l'URL
        if (user == null && tokenParam != null && !tokenParam.isEmpty()) {
            try {
                String email = jwtService.extractUsername(tokenParam);
                if (email != null && !email.isEmpty()) {
                    User tokenUser = notificationService.getUserByEmail(email);
                    if (tokenUser != null && jwtService.isTokenValid(tokenParam, tokenUser)) {
                        user = tokenUser;
                    }
                }
            } catch (Exception e) {
                throw new RuntimeException("Invalid token provided: " + e.getMessage());
            }
        }
        
        if (user == null) {
            throw new RuntimeException("Authentication required");
        }
        
        return notificationService.createEmitter(user);
    }

    @Operation(summary = "Obtenir le nombre d'utilisateurs connectés")
    @GetMapping("/connected-users")
    public int getConnectedUsersCount() {
        return notificationService.getConnectedUsersCount();
    }
}
