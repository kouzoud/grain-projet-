package com.solidarlink.backend.service;

import com.solidarlink.backend.dto.CasHumanitaireDTO;
import com.solidarlink.backend.entity.CasHumanitaire;
import com.solidarlink.backend.entity.User;
import com.solidarlink.backend.enums.CasCategorie;
import com.solidarlink.backend.enums.CasStatut;
import com.solidarlink.backend.exception.ResourceNotFoundException;
import com.solidarlink.backend.repository.CasHumanitaireRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CasHumanitaireServiceTest {

    @Mock
    private CasHumanitaireRepository casRepository;

    @Mock
    private AuthService authService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private CasHumanitaireService casService;

    private User testUser;
    private CasHumanitaire testCase;
    private GeometryFactory geometryFactory;

    @BeforeEach
    void setUp() {
        geometryFactory = new GeometryFactory();
        
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");

        Point location = geometryFactory.createPoint(new Coordinate(-7.5898, 33.5731));
        
        testCase = CasHumanitaire.builder()
                .id(1L)
                .titre("Test Case")
                .description("Test Description")
                .categorie(CasCategorie.ALIMENTAIRE)
                .status(CasStatut.EN_ATTENTE)
                .location(location)
                .author(testUser)
                .build();
    }

    @Test
    void shouldGetAllCasesPaginated() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<CasHumanitaire> expectedPage = new PageImpl<>(Arrays.asList(testCase));
        when(casRepository.findAll(pageable)).thenReturn(expectedPage);

        // When
        Page<CasHumanitaire> result = casService.getAllCasesPaginated(pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitre()).isEqualTo("Test Case");
        verify(casRepository).findAll(pageable);
    }

    @Test
    void shouldGetCasesByStatus() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<CasHumanitaire> expectedPage = new PageImpl<>(Arrays.asList(testCase));
        when(casRepository.findByStatus(CasStatut.EN_ATTENTE, pageable)).thenReturn(expectedPage);

        // When
        Page<CasHumanitaire> result = casService.getCasesByStatus(CasStatut.EN_ATTENTE, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(casRepository).findByStatus(CasStatut.EN_ATTENTE, pageable);
    }

    @Test
    void shouldThrowExceptionWhenCaseNotFound() {
        // Given
        when(casRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> casService.getCaseById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Case not found");
    }

    @Test
    void shouldDeleteCase() {
        // Given
        when(casRepository.findById(1L)).thenReturn(Optional.of(testCase));

        // When
        casService.deleteCase(1L, testUser);

        // Then
        verify(casRepository).delete(testCase);
    }

    @Test
    void shouldResolveCaseSuccessfully() {
        // Given
        testCase.setStatus(CasStatut.EN_COURS);
        testCase.setVolunteer(testUser);
        when(casRepository.findById(1L)).thenReturn(Optional.of(testCase));
        when(casRepository.save(any(CasHumanitaire.class))).thenAnswer(invocation -> {
            CasHumanitaire cas = invocation.getArgument(0);
            cas.setStatus(CasStatut.RESOLU);
            return cas;
        });

        // When
        CasHumanitaire resolved = casService.resolveCase(1L, testUser);

        // Then
        assertThat(resolved.getStatus()).isEqualTo(CasStatut.RESOLU);
        verify(casRepository).save(any(CasHumanitaire.class));
    }
}
