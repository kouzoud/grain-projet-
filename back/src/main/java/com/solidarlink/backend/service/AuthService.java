package com.solidarlink.backend.service;

import com.solidarlink.backend.config.JwtService;
import com.solidarlink.backend.dto.AuthDTOs;
import com.solidarlink.backend.entity.User;
import com.solidarlink.backend.enums.Role;
import com.solidarlink.backend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    // Chemin absolu vers le dossier uploads
    // Si on démarre depuis la racine du projet, utiliser ./uploads
    // Si on démarre depuis back/, utiliser ./uploads
    private final Path rootLocation = Paths.get(System.getProperty("user.dir")).resolve("uploads");

    /**
     * Initialisation du dossier uploads au démarrage du service
     */
    @PostConstruct
    public void init() {
        try {
            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
                log.info("📁 Dossier uploads créé: {}", rootLocation.toAbsolutePath());
            } else {
                log.info("✅ Dossier uploads existe: {}", rootLocation.toAbsolutePath());
            }
            
            // Vérifier les permissions d'écriture
            if (!Files.isWritable(rootLocation)) {
                log.error("❌ ERREUR: Pas de permissions d'écriture sur: {}", rootLocation.toAbsolutePath());
            } else {
                log.info("✅ Permissions d'écriture OK sur: {}", rootLocation.toAbsolutePath());
            }
        } catch (IOException e) {
            log.error("❌ ERREUR lors de la création du dossier uploads: {}", e.getMessage(), e);
        }
    }

    public AuthDTOs.AuthenticationResponse register(AuthDTOs.RegisterRequest request) {
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("EMAIL_EXISTS:Cet email est déjà utilisé. Essayez de vous connecter.");
        }
        
        var user = User.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .telephone(request.getTelephone())
                .role(request.getRole())
                .competences(request.getCompetences())
                .disponibilite(request.getDisponibilite())
                .zoneAction(request.getZoneAction())
                .documentUrl(request.getDocumentUrl())
                .documentType(request.getDocumentType())
                .isValidated(false) // All users need validation by default
                .build();

        userRepository.save(user);
        
        // Envoi de l'email de bienvenue (asynchrone, ne bloque pas l'inscription)
        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getPrenom());
            log.info("📧 Email de bienvenue envoyé à : {}", user.getEmail());
        } catch (Exception e) {
            // L'échec de l'envoi d'email ne doit pas bloquer l'inscription
            log.warn("⚠️ Impossible d'envoyer l'email de bienvenue à {} : {}", user.getEmail(), e.getMessage());
        }
        
        var jwtToken = jwtService.generateToken(user);
        return AuthDTOs.AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .build();
    }

    public AuthDTOs.AuthenticationResponse login(AuthDTOs.AuthenticationRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));
        } catch (Exception e) {
            log.warn("⚠️ Échec d'authentification pour l'email : {}", request.getEmail());
            throw new RuntimeException("Email ou mot de passe incorrect");
        }
        
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (user.isBanned()) {
            log.warn("🚫 Tentative de connexion d'un compte banni : {}", user.getEmail());
            throw new RuntimeException("Votre compte a été suspendu. Contactez l'administration.");
        }

        if (!user.isValidated()) {
            log.info("⏳ Tentative de connexion d'un compte non validé : {}", user.getEmail());
            throw new RuntimeException("Votre compte n'est pas encore validé. Un administrateur doit approuver votre inscription.");
        }

        log.info("✅ Connexion réussie pour : {} ({})", user.getEmail(), user.getRole());
        var jwtToken = jwtService.generateToken(user);
        return AuthDTOs.AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .build();
    }

    public String saveFile(MultipartFile file) throws IOException {
        try {
            // Validate file
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("Fichier vide ou null");
            }
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.equals("image/jpeg") &&
                    !contentType.equals("image/jpg") &&
                    !contentType.equals("image/png") &&
                    !contentType.equals("image/webp") &&
                    !contentType.equals("image/gif") &&
                    !contentType.equals("application/pdf"))) {
                throw new IllegalArgumentException("Format de fichier non supporté. Utilisez JPG, PNG, WebP, GIF ou PDF.");
            }

            // Ensure uploads directory exists
            if (!Files.exists(rootLocation)) {
                try {
                    Files.createDirectories(rootLocation);
                    log.info("📁 Dossier uploads créé: {}", rootLocation.toAbsolutePath());
                } catch (IOException e) {
                    log.error("❌ Impossible de créer le dossier uploads: {} - {}", rootLocation.toAbsolutePath(), e.getMessage());
                    throw new IOException("Impossible de créer le dossier uploads: " + e.getMessage());
                }
            }
            
            // Check write permissions
            if (!Files.isWritable(rootLocation)) {
                log.error("❌ Pas de permissions d'écriture sur: {}", rootLocation.toAbsolutePath());
                throw new IOException("Pas de permissions d'écriture sur le dossier uploads");
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                originalFilename = "file";
            }
            String filename = UUID.randomUUID().toString() + "_" + originalFilename;
            Path destinationFile = rootLocation.resolve(filename).normalize();
            
            // Security check: prevent path traversal
            if (!destinationFile.startsWith(rootLocation)) {
                throw new IOException("Cannot store file outside upload directory");
            }
            
            // Save file
            Files.copy(file.getInputStream(), destinationFile);
            log.info("✅ Fichier sauvegardé: {} - Taille: {} bytes - Path: {}", 
                    filename, file.getSize(), destinationFile.toAbsolutePath());
            
            return filename;
        } catch (IOException e) {
            log.error("❌ Erreur lors de la sauvegarde du fichier: {}", e.getMessage(), e);
            throw e;
        }
    }
}
