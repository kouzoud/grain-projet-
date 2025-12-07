package com.solidarlink.backend.config;

import com.solidarlink.backend.config.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // Routes publiques (sans token)
                .requestMatchers(
                    "/api/auth/**", 
                    "/api/public/**", 
                    "/api/uploads/**", 
                    "/api/notifications/stream"
                ).permitAll()
                // Toutes les autres routes nécessitent un token
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 1. Origines Autorisées (Local + Prod)
        configuration.setAllowedOrigins(List.of(
            "http://localhost:5173", 
            "http://localhost:5174",
            "http://link2act.cloud",
            "https://link2act.cloud",
            "http://www.link2act.cloud",
            "https://www.link2act.cloud"
        ));

        // 2. Méthodes HTTP Autorisées
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // 3. Headers Autorisés (tous les headers pour éviter les blocages)
        configuration.setAllowedHeaders(List.of("*"));

        // 4. Headers Exposés (CRUCIAL pour que le Frontend puisse lire le nom du fichier PDF/CSV)
        configuration.setExposedHeaders(List.of(
            "Access-Control-Allow-Origin", 
            "Access-Control-Allow-Credentials", 
            "Content-Disposition", // Indispensable pour les téléchargements
            "Content-Type"
        ));

        configuration.setAllowCredentials(true);
        
        // 5. Cache de la configuration CORS (1 heure) pour améliorer la vitesse
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}