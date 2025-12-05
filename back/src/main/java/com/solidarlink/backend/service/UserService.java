package com.solidarlink.backend.service;

import com.solidarlink.backend.dto.UserProfileDTO;
import com.solidarlink.backend.entity.User;
import com.solidarlink.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public UserProfileDTO getProfile(User user) {
        return UserProfileDTO.builder()
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .telephone(user.getTelephone())
                .competences(user.getCompetences())
                .disponibilite(user.getDisponibilite())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    public UserProfileDTO updateProfile(User user, UserProfileDTO request) {
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setTelephone(request.getTelephone());
        user.setCompetences(request.getCompetences());
        user.setDisponibilite(request.getDisponibilite());

        userRepository.save(user);
        return getProfile(user);
    }

    public void changePassword(User user, Map<String, String> request) {
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Invalid current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public String uploadAvatar(User user, MultipartFile file) throws IOException {
        String filename = authService.saveFile(file);
        user.setAvatarUrl(filename);
        userRepository.save(user);
        return filename;
    }
}
