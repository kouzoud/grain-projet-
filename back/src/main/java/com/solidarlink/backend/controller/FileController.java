package com.solidarlink.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/uploads")
@Tag(name = "Files", description = "Serving des fichiers uploadés")
@Slf4j
public class FileController {
    
    // Le backend démarre depuis la racine du projet (C:\Users\PC\Desktop\Grain\projet)
    // donc on utilise ./uploads directement
    private final Path uploadDir = Paths.get(System.getProperty("user.dir")).resolve("uploads");
    
    @Operation(summary = "Récupérer un fichier uploadé")
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            // Résoudre le chemin du fichier
            Path filePath = uploadDir.resolve(filename).normalize();
            
            // Vérifier que le fichier existe et est dans le dossier uploads (sécurité)
            if (!filePath.startsWith(uploadDir)) {
                log.warn("🚨 Tentative d'accès à un fichier hors du dossier uploads : {}", filename);
                return ResponseEntity.badRequest().build();
            }
            
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists() || !resource.isReadable()) {
                log.warn("❌ Fichier introuvable ou illisible : {}", filename);
                return ResponseEntity.notFound().build();
            }
            
            // Détecter le type MIME
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            log.info("✅ Serving file: {} - Type: {} - Size: {} bytes", 
                     filename, contentType, resource.contentLength());
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
                    
        } catch (IOException e) {
            log.error("❌ Erreur lors de la lecture du fichier : {} - {}", filename, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
