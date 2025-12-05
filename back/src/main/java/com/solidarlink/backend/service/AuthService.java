package com.solidarlink.backend.service;

import com.solidarlink.backend.config.JwtService;
import com.solidarlink.backend.dto.AuthDTOs;
import com.solidarlink.backend.entity.User;
import com.solidarlink.backend.enums.Role;
import com.solidarlink.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    private final Path rootLocation = Paths.get("uploads");

    public AuthDTOs.AuthenticationResponse register(AuthDTOs.RegisterRequest request) {
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
        var jwtToken = jwtService.generateToken(user);
        return AuthDTOs.AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .build();
    }

    public AuthDTOs.AuthenticationResponse login(AuthDTOs.AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        if (user.isBanned()) {
            throw new RuntimeException("User is banned");
        }

        if (!user.isValidated()) {
            throw new RuntimeException("Account not validated. Please wait for admin approval.");
        }

        var jwtToken = jwtService.generateToken(user);
        return AuthDTOs.AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .build();
    }

    public String saveFile(MultipartFile file) throws IOException {
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") &&
                !contentType.equals("image/png") &&
                !contentType.equals("application/pdf"))) {
            throw new IllegalArgumentException("Format de fichier non supporté. Utilisez JPG, PNG ou PDF.");
        }

        if (!Files.exists(rootLocation)) {
            Files.createDirectories(rootLocation);
        }
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), this.rootLocation.resolve(filename));
        return filename;
    }
}
