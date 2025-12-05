package com.solidarlink.backend.service;

import com.solidarlink.backend.dto.InterventionDTOs;
import com.solidarlink.backend.entity.CasHumanitaire;
import com.solidarlink.backend.entity.Intervention;
import com.solidarlink.backend.entity.User;
import com.solidarlink.backend.enums.CasStatut;
import com.solidarlink.backend.repository.CasHumanitaireRepository;
import com.solidarlink.backend.repository.InterventionRepository;
import com.solidarlink.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InterventionService {

    private final InterventionRepository interventionRepository;
    private final CasHumanitaireRepository casRepository;
    private final UserRepository userRepository;
    // private final NotificationService notificationService; // Assuming it exists
    // or will be added later

    @Transactional
    public void confirmIntervention(InterventionDTOs.InterventionRequest request, String userEmail) {
        // 1. Validate Case
        CasHumanitaire cas = casRepository.findById(request.getCasId())
                .orElseThrow(() -> new RuntimeException("Cas non trouvé"));

        if (cas.getStatus() != CasStatut.VALIDE && cas.getStatus() != CasStatut.EN_COURS) {
            throw new RuntimeException("Ce cas n'est plus disponible pour une intervention");
        }

        // 2. Get Volunteer (from logged in user email to be secure)
        User benevole = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Bénévole non trouvé"));

        // 3. Create Intervention
        Intervention intervention = Intervention.builder()
                .cas(cas)
                .benevole(benevole)
                .dateIntervention(request.getDateIntervention())
                .message(request.getMessage())
                .build();

        interventionRepository.save(intervention);

        // 4. Update Case Status
        cas.setStatus(CasStatut.EN_COURS);
        cas.setVolunteer(benevole); // Assign volunteer to case
        casRepository.save(cas);

        // 5. Notify Demandeur (Placeholder for now as NotificationService might need
        // setup)
        // notificationService.notifyDemandeAccepted(cas, intervention);
    }
}
