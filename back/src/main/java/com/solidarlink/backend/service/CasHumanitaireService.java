package com.solidarlink.backend.service;

import com.solidarlink.backend.dto.CasHumanitaireDTO;
import com.solidarlink.backend.dto.InterventionDTO;
import com.solidarlink.backend.entity.CasHumanitaire;
import com.solidarlink.backend.entity.User;
import com.solidarlink.backend.enums.CasCategorie;
import com.solidarlink.backend.enums.CasStatut;
import com.solidarlink.backend.repository.CasHumanitaireRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CasHumanitaireService {

    private final CasHumanitaireRepository casRepository;
    private final AuthService authService;
    private final NotificationService notificationService;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    public CasHumanitaire createCase(CasHumanitaireDTO request, User author) throws IOException {
        List<String> photoUrls = new ArrayList<>();
        if (request.getPhotos() != null) {
            for (MultipartFile photo : request.getPhotos()) {
                photoUrls.add(authService.saveFile(photo));
            }
        }

        Point location = geometryFactory.createPoint(new Coordinate(request.getLongitude(), request.getLatitude()));

        CasHumanitaire cas = CasHumanitaire.builder()
                .titre(request.getTitre())
                .description(request.getDescription())
                .categorie(request.getCategorie())
                .location(location)
                .photos(photoUrls)
                .author(author)
                .status(CasStatut.EN_ATTENTE)
                .build();

        CasHumanitaire savedCase = casRepository.save(cas);

        // Notification temps réel : nouveau cas créé
        notificationService.broadcastNotification(
                "case_created",
                String.format("Nouveau cas créé: %s", savedCase.getTitre())
        );

        return savedCase;
    }

    public CasHumanitaire updateCase(Long id, CasHumanitaireDTO request, User user) throws IOException {
        CasHumanitaire cas = casRepository.findById(id).orElseThrow(() -> new RuntimeException("Case not found"));

        if (!cas.getAuthor().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Not authorized");
        }

        cas.setTitre(request.getTitre());
        cas.setDescription(request.getDescription());
        cas.setCategorie(request.getCategorie());

        Point location = geometryFactory.createPoint(new Coordinate(request.getLongitude(), request.getLatitude()));
        cas.setLocation(location);

        List<String> currentPhotos = new ArrayList<>();
        if (request.getExistingPhotos() != null) {
            currentPhotos.addAll(request.getExistingPhotos());
        }

        if (request.getPhotos() != null) {
            for (MultipartFile photo : request.getPhotos()) {
                currentPhotos.add(authService.saveFile(photo));
            }
        }
        cas.setPhotos(currentPhotos);

        CasHumanitaire updatedCase = casRepository.save(cas);

        // Notification temps réel : cas mis à jour
        notificationService.sendNotificationToUser(
                cas.getAuthor().getId(),
                "case_updated",
                String.format("Votre cas '%s' a été mis à jour", updatedCase.getTitre())
        );

        return updatedCase;
    }

    public void deleteCase(Long id, User user) {
        CasHumanitaire cas = casRepository.findById(id).orElseThrow(() -> new RuntimeException("Case not found"));
        if (!cas.getAuthor().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Not authorized");
        }
        casRepository.delete(cas);
    }

    public List<CasHumanitaire> getAllCases() {
        return casRepository.findAll();
    }

    // ========== PAGINATED METHODS (NEW) ==========
    public Page<CasHumanitaire> getAllCasesPaginated(Pageable pageable) {
        return casRepository.findAll(pageable);
    }

    public Page<CasHumanitaire> getCasesByStatus(CasStatut status, Pageable pageable) {
        return casRepository.findByStatus(status, pageable);
    }

    public Page<CasHumanitaire> getCasesByCategorie(CasCategorie categorie, Pageable pageable) {
        return casRepository.findByCategorie(categorie, pageable);
    }

    public Page<CasHumanitaire> getCasesByStatusAndCategorie(CasStatut status, CasCategorie categorie, Pageable pageable) {
        return casRepository.findByStatusAndCategorie(status, categorie, pageable);
    }

    public Page<CasHumanitaire> getCasesWithinViewport(double minLon, double minLat, double maxLon, double maxLat, 
                                                        CasStatut status, Pageable pageable) {
        if (status != null) {
            return casRepository.findWithinViewportAndStatus(minLon, minLat, maxLon, maxLat, status.name(), pageable);
        }
        return casRepository.findWithinViewport(minLon, minLat, maxLon, maxLat, pageable);
    }

    public Page<CasHumanitaire> getMyCasesPaginated(User user, Pageable pageable) {
        return casRepository.findByAuthor(user, pageable);
    }

    public Page<CasHumanitaire> getMyInterventionsPaginated(User volunteer, Pageable pageable) {
        return casRepository.findByVolunteer(volunteer, pageable);
    }

    public List<CasHumanitaire> getMyCases(User user) {
        return casRepository.findByAuthor(user);
    }

    public List<CasHumanitaire> getValidatedCases() {
        List<CasHumanitaire> cases = casRepository.findByStatus(CasStatut.VALIDE);
        // Force le chargement des photos pour éviter LazyInitializationException
        cases.forEach(cas -> cas.getPhotos().size());
        return cases;
    }

    public List<CasHumanitaire> getNearbyCases(double latitude, double longitude, double radius) {
        return casRepository.findNearbyCases(latitude, longitude, radius);
    }

    public CasHumanitaire getCaseById(Long id) {
        return casRepository.findById(id).orElseThrow(() -> new RuntimeException("Case not found"));
    }

    public CasHumanitaire takeCase(Long id, InterventionDTO intervention, User volunteer) {
        CasHumanitaire cas = casRepository.findById(id).orElseThrow(() -> new RuntimeException("Case not found"));

        if (cas.getStatus() != CasStatut.VALIDE) {
            throw new RuntimeException("Case is not validated");
        }

        cas.setVolunteer(volunteer);
        cas.setStatus(CasStatut.EN_COURS);
        cas.setDateIntervention(intervention.getDateIntervention());
        cas.setMessageIntervention(intervention.getMessageIntervention());

        CasHumanitaire updatedCase = casRepository.save(cas);

        // Notification temps réel : intervention confirmée
        notificationService.sendNotificationToUser(
                cas.getAuthor().getId(),
                "intervention_confirmed",
                String.format("Un volontaire a pris en charge votre cas '%s'", updatedCase.getTitre())
        );

        return updatedCase;
    }

    public List<CasHumanitaire> getMyInterventions(User volunteer) {
        return casRepository.findByVolunteer(volunteer);
    }

    public CasHumanitaire resolveCase(Long id, User user) {
        CasHumanitaire cas = casRepository.findById(id).orElseThrow(() -> new RuntimeException("Case not found"));

        // Only author or volunteer can resolve? Usually author confirms resolution.
        if (!cas.getAuthor().getId().equals(user.getId()) &&
                (cas.getVolunteer() == null || !cas.getVolunteer().getId().equals(user.getId()))) {
            throw new RuntimeException("Not authorized");
        }

        cas.setStatus(CasStatut.RESOLU);
        CasHumanitaire resolvedCase = casRepository.save(cas);

        // Notification temps réel : cas résolu
        if (cas.getVolunteer() != null) {
            notificationService.sendNotificationToUser(
                    cas.getVolunteer().getId(),
                    "case_resolved",
                    String.format("Le cas '%s' a été marqué comme résolu", resolvedCase.getTitre())
            );
        }

        return resolvedCase;
    }
}
