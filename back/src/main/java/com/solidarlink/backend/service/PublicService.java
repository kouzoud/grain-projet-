package com.solidarlink.backend.service;

import com.solidarlink.backend.dto.StatsDTOs;
import com.solidarlink.backend.enums.CasStatut;
import com.solidarlink.backend.enums.Role;
import com.solidarlink.backend.repository.CasHumanitaireRepository;
import com.solidarlink.backend.repository.UserRepository;
import com.solidarlink.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PublicService {

    private final UserRepository userRepository;
    private final CasHumanitaireRepository casRepository;

    public StatsDTOs.PublicStatsDTO getStats() {
        return StatsDTOs.PublicStatsDTO.builder()
                .volunteers(userRepository.findByRole(Role.BENEVOLE).size())
                .missions(casRepository.findByStatus(CasStatut.RESOLU).size())
                .cities(5) // Mock data
                .build();
    }

    public StatsDTOs.ImpactStatsDTO getImpactStats() {
        long activeVolunteers = userRepository.findByRole(Role.BENEVOLE).stream().filter(User::isValidated).count();
        long completedMissions = casRepository.countResolus();
        long totalMissions = casRepository.count();

        double successRate = totalMissions > 0 ? ((double) completedMissions / totalMissions) * 100 : 0;

        // Mocking growth and cities for now as they require more complex queries/data
        double volunteerGrowth = 12.5;
        long coveredCities = 8;

        System.out.println("DEBUG IMPACT STATS -> Active Volunteers: " + activeVolunteers);
        System.out.println("DEBUG IMPACT STATS -> Completed Missions: " + completedMissions);
        System.out.println("DEBUG IMPACT STATS -> Total Missions: " + totalMissions);

        return StatsDTOs.ImpactStatsDTO.builder()
                .activeVolunteers(activeVolunteers)
                .volunteerGrowth(volunteerGrowth)
                .coveredCities(coveredCities)
                .completedMissions(completedMissions)
                .successRate(Math.round(successRate * 10.0) / 10.0)
                .build();
    }

    public java.util.List<com.solidarlink.backend.dto.CasHumanitaireDTO> getLatestResolvedCases() {
        return casRepository.findTop3ByStatusOrderByUpdatedAtDesc(CasStatut.RESOLU).stream()
                .map(this::mapToDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    private com.solidarlink.backend.dto.CasHumanitaireDTO mapToDTO(com.solidarlink.backend.entity.CasHumanitaire cas) {
        return com.solidarlink.backend.dto.CasHumanitaireDTO.builder()
                .id(cas.getId())
                .titre(cas.getTitre())
                .description(cas.getDescription())
                .categorie(cas.getCategorie())
                .statut(cas.getStatus())
                .latitude(cas.getLatitude())
                .longitude(cas.getLongitude())
                .existingPhotos(cas.getPhotos())
                .createdAt(cas.getCreatedAt())
                .updatedAt(cas.getUpdatedAt())
                .build();
    }
}
