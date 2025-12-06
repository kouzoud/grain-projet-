package com.solidarlink.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.solidarlink.backend.dto.AuthDTOs;
import com.solidarlink.backend.enums.Role;
import com.solidarlink.backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    void shouldRegisterUserSuccessfully() throws Exception {
        // Given
        AuthDTOs.RegisterRequest request = AuthDTOs.RegisterRequest.builder()
                .nom("Test")
                .prenom("User")
                .email("test@example.com")
                .password("Password123!")
                .telephone("0612345678")
                .role(Role.CITOYEN)
                .build();

        AuthDTOs.AuthenticationResponse response = AuthDTOs.AuthenticationResponse.builder()
                .token("mock-jwt-token")
                .role("CITOYEN")
                .nom("Test")
                .prenom("User")
                .build();

        when(authService.register(any())).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.role").value("CITOYEN"))
                .andExpect(jsonPath("$.nom").value("Test"));
    }

    @Test
    void shouldFailRegisterWithInvalidEmail() throws Exception {
        // Given
        AuthDTOs.RegisterRequest request = AuthDTOs.RegisterRequest.builder()
                .nom("Test")
                .prenom("User")
                .email("invalid-email") // Email invalide
                .password("Password123!")
                .telephone("0612345678")
                .role(Role.CITOYEN)
                .build();

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.email").exists());
    }

    @Test
    void shouldFailRegisterWithShortPassword() throws Exception {
        // Given
        AuthDTOs.RegisterRequest request = AuthDTOs.RegisterRequest.builder()
                .nom("Test")
                .prenom("User")
                .email("test@example.com")
                .password("Pass1!") // Mot de passe trop court
                .telephone("0612345678")
                .role(Role.CITOYEN)
                .build();

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.password").exists());
    }

    @Test
    void shouldLoginSuccessfully() throws Exception {
        // Given
        AuthDTOs.AuthenticationRequest request = AuthDTOs.AuthenticationRequest.builder()
                .email("test@example.com")
                .password("Password123!")
                .build();

        AuthDTOs.AuthenticationResponse response = AuthDTOs.AuthenticationResponse.builder()
                .token("mock-jwt-token")
                .role("CITOYEN")
                .nom("Test")
                .prenom("User")
                .build();

        when(authService.login(any())).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.role").value("CITOYEN"));
    }

    @Test
    void shouldFailLoginWithMissingEmail() throws Exception {
        // Given
        AuthDTOs.AuthenticationRequest request = AuthDTOs.AuthenticationRequest.builder()
                .password("Password123!")
                .build();

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.email").exists());
    }
}
