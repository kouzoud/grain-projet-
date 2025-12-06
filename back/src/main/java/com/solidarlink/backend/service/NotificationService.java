package com.solidarlink.backend.service;

import com.solidarlink.backend.entity.User;
import com.solidarlink.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Service pour gérer les notifications en temps réel via Server-Sent Events (SSE)
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final UserRepository userRepository;

    // Map userId -> List of SseEmitters
    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> userEmitters = new ConcurrentHashMap<>();

    // Timeout de 30 minutes pour les connexions SSE
    private static final long SSE_TIMEOUT = 30L * 60 * 1000;

    /**
     * Créer une nouvelle connexion SSE pour un utilisateur
     */
    public SseEmitter createEmitter(User user) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        Long userId = user.getId();

        // Ajouter l'emitter à la liste de l'utilisateur
        userEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        log.info("New SSE connection created for user: {}", userId);

        // Gérer la fermeture et les erreurs
        emitter.onCompletion(() -> {
            removeEmitter(userId, emitter);
            log.info("SSE connection completed for user: {}", userId);
        });

        emitter.onTimeout(() -> {
            removeEmitter(userId, emitter);
            log.info("SSE connection timeout for user: {}", userId);
        });

        emitter.onError((ex) -> {
            removeEmitter(userId, emitter);
            log.error("SSE connection error for user: {}", userId, ex);
        });

        // Envoyer un message de connexion initiale
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("Connexion établie"));
        } catch (IOException e) {
            log.error("Error sending initial message to user: {}", userId, e);
            removeEmitter(userId, emitter);
        }

        return emitter;
    }

    /**
     * Envoyer une notification à un utilisateur spécifique
     */
    public void sendNotificationToUser(Long userId, String eventName, Object data) {
        CopyOnWriteArrayList<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters != null && !emitters.isEmpty()) {
            emitters.forEach(emitter -> {
                try {
                    emitter.send(SseEmitter.event()
                            .name(eventName)
                            .data(data));
                    log.debug("Notification sent to user {} - Event: {}", userId, eventName);
                } catch (IOException e) {
                    log.error("Error sending notification to user: {}", userId, e);
                    removeEmitter(userId, emitter);
                }
            });
        }
    }

    /**
     * Envoyer une notification à plusieurs utilisateurs
     */
    public void sendNotificationToUsers(Iterable<Long> userIds, String eventName, Object data) {
        userIds.forEach(userId -> sendNotificationToUser(userId, eventName, data));
    }

    /**
     * Envoyer une notification broadcast à tous les utilisateurs connectés
     */
    public void broadcastNotification(String eventName, Object data) {
        userEmitters.keySet().forEach(userId -> sendNotificationToUser(userId, eventName, data));
    }

    /**
     * Supprimer un emitter de la liste
     */
    private void removeEmitter(Long userId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                userEmitters.remove(userId);
            }
        }
    }

    /**
     * Obtenir le nombre d'utilisateurs connectés
     */
    public int getConnectedUsersCount() {
        return userEmitters.size();
    }

    /**
     * Vérifier si un utilisateur est connecté
     */
    public boolean isUserConnected(Long userId) {
        CopyOnWriteArrayList<SseEmitter> emitters = userEmitters.get(userId);
        return emitters != null && !emitters.isEmpty();
    }

    /**
     * Récupérer un utilisateur par son email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
}
