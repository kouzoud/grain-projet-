package com.solidarlink.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class StatsDTOs {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AdminStatsDTO {
        private long totalUsers;
        private long pendingUsers;
        private long activeVolunteers; // Added
        private long totalCases;
        private long activeCases;
        private long resolvedCases;
        private long pendingCases; // Added
        private long rejectedCases; // Added
        private java.util.Map<String, Long> casesByCategory; // Added
        private java.util.Map<String, Long> casesByDate; // Added
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PublicStatsDTO {
        private long volunteers;
        private long missions;
        private long cities;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ImpactStatsDTO {
        private long activeVolunteers;
        private double volunteerGrowth;
        private long coveredCities;
        private long completedMissions;
        private double successRate;
    }
}
