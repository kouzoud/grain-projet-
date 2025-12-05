package com.solidarlink.backend.service;

import com.solidarlink.backend.dto.StatsDTOs;
import com.solidarlink.backend.entity.CasHumanitaire;
import com.solidarlink.backend.entity.Signalement;
import com.solidarlink.backend.entity.User;
import com.solidarlink.backend.enums.CasStatut;
import com.solidarlink.backend.enums.Role;
import com.solidarlink.backend.repository.CasHumanitaireRepository;
import com.solidarlink.backend.repository.SignalementRepository;
import com.solidarlink.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CasHumanitaireRepository casRepository;
    private final SignalementRepository signalementRepository;

    public List<User> getPendingUsers() {
        return userRepository.findByIsValidatedFalse();
    }

    public void validateUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setValidated(true);
        userRepository.save(user);
    }

    public void rejectUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void toggleUserBan(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setBanned(!user.isBanned());
        userRepository.save(user);
    }

    public List<CasHumanitaire> getAllCases() {
        return casRepository.findAll();
    }

    public void updateCaseStatus(Long caseId, CasStatut status) {
        CasHumanitaire cas = casRepository.findById(caseId).orElseThrow();

        // Fix: If Admin sets to EN_COURS (Validated) but no volunteer is assigned yet,
        // we must set it to VALIDE so it appears on the map for volunteers.
        if (status == CasStatut.EN_COURS && cas.getVolunteer() == null) {
            cas.setStatus(CasStatut.VALIDE);
        } else {
            cas.setStatus(status);
        }

        casRepository.save(cas);
    }

    public void deleteCase(Long caseId) {
        casRepository.deleteById(caseId);
    }

    public List<Signalement> getAllSignalements() {
        return signalementRepository.findAll();
    }

    public void closeSignalement(Long signalementId) {
        Signalement signalement = signalementRepository.findById(signalementId).orElseThrow();
        signalement.setClosed(true);
        signalementRepository.save(signalement);
    }

    public StatsDTOs.AdminStatsDTO getStats() {
        long totalUsers = userRepository.count();
        long pendingUsers = userRepository.findByIsValidatedFalse().size();
        long activeVolunteers = userRepository.findByRole(Role.BENEVOLE).stream().filter(User::isValidated).count();

        long totalCases = casRepository.count();
        long activeCases = casRepository.countEnCours();
        long resolvedCases = casRepository.countResolus();
        long pendingCases = casRepository.countEnAttente();
        long rejectedCases = casRepository.countRejetes();

        System.out.println("DEBUG ADMIN STATS -> Total Users: " + totalUsers);
        System.out.println("DEBUG ADMIN STATS -> Pending Users: " + pendingUsers);
        System.out.println("DEBUG ADMIN STATS -> Active Volunteers: " + activeVolunteers);
        System.out.println("DEBUG ADMIN STATS -> Total Cases: " + totalCases);
        System.out.println("DEBUG ADMIN STATS -> Pending Cases: " + pendingCases);
        System.out.println("DEBUG ADMIN STATS -> Active Cases: " + activeCases);
        System.out.println("DEBUG ADMIN STATS -> Resolved Cases: " + resolvedCases);
        System.out.println("DEBUG ADMIN STATS -> Rejected Cases: " + rejectedCases);

        return StatsDTOs.AdminStatsDTO.builder()
                .totalUsers(totalUsers)
                .pendingUsers(pendingUsers)
                .activeVolunteers(activeVolunteers)
                .totalCases(totalCases)
                .activeCases(activeCases)
                .resolvedCases(resolvedCases)
                .pendingCases(pendingCases)
                .rejectedCases(rejectedCases)
                .casesByCategory(calculateCasesByCategory())
                .casesByDate(calculateCasesByDate())
                .build();
    }

    private java.util.Map<String, Long> calculateCasesByCategory() {
        List<CasHumanitaire> cases = casRepository.findAll();
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        for (CasHumanitaire c : cases) {
            String category = c.getCategorie() != null ? c.getCategorie().name() : "UNKNOWN";
            stats.put(category, stats.getOrDefault(category, 0L) + 1);
        }
        return stats;
    }

    private java.util.Map<String, Long> calculateCasesByDate() {
        List<CasHumanitaire> cases = casRepository.findAll();
        java.util.Map<String, Long> stats = new java.util.TreeMap<>(); // TreeMap for sorting by date keys

        // Initialize last 7 days with 0
        java.time.LocalDate today = java.time.LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            stats.put(today.minusDays(i).toString(), 0L);
        }

        for (CasHumanitaire c : cases) {
            if (c.getCreatedAt() != null) {
                java.time.LocalDate date = c.getCreatedAt().toLocalDate();
                if (!date.isBefore(today.minusDays(6))) {
                    String dateStr = date.toString();
                    stats.put(dateStr, stats.getOrDefault(dateStr, 0L) + 1);
                }
            }
        }
        return stats;
    }
}
