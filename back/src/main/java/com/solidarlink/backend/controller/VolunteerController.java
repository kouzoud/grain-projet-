package com.solidarlink.backend.controller;

import com.solidarlink.backend.entity.User;
import com.solidarlink.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/volunteer")
public class VolunteerController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getVolunteerStats() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Map<String, Object> stats = new HashMap<>();
            stats.put("level", user.getLevel());
            stats.put("points", user.getPoints());
            stats.put("missionsCompleted", user.getMissionsCompleted());
            stats.put("hoursVolunteered", user.getHoursVolunteered());

            // Calculate next level points
            int nextLevelPoints = 200;
            if ("Argent".equals(user.getLevel()))
                nextLevelPoints = 500;
            else if ("Or".equals(user.getLevel()))
                nextLevelPoints = 1000;
            else if ("Platine".equals(user.getLevel()))
                nextLevelPoints = 2000;

            stats.put("nextLevelPoints", nextLevelPoints);
            stats.put("impactScore", user.getPoints() / 2); // Simple calculation for now

            return ResponseEntity.ok(stats);
        }

        return ResponseEntity.notFound().build();
    }
}
