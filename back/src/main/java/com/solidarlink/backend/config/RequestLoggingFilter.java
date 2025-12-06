package com.solidarlink.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Filtre pour journaliser les requêtes HTTP
 * Ajoute un ID de corrélation (correlationId) dans le MDC pour tracer les requêtes
 */
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);
    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String CORRELATION_ID_MDC_KEY = "correlationId";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        long startTime = System.currentTimeMillis();

        // Générer ou récupérer l'ID de corrélation
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }

        // Ajouter l'ID de corrélation au MDC pour le traçage
        MDC.put(CORRELATION_ID_MDC_KEY, correlationId);
        MDC.put("requestUri", request.getRequestURI());

        try {
            // Ajouter l'ID de corrélation à la réponse
            response.setHeader(CORRELATION_ID_HEADER, correlationId);

            logger.info("Incoming request: {} {} from {}",
                    request.getMethod(),
                    request.getRequestURI(),
                    request.getRemoteAddr());

            filterChain.doFilter(request, response);

            long duration = System.currentTimeMillis() - startTime;
            logger.info("Completed request: {} {} - Status: {} - Duration: {}ms",
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    duration);

        } catch (Exception e) {
            logger.error("Error processing request: {} {}",
                    request.getMethod(),
                    request.getRequestURI(),
                    e);
            throw e;
        } finally {
            // Nettoyer le MDC
            MDC.clear();
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Ne pas logger les requêtes vers les ressources statiques
        String path = request.getRequestURI();
        return path.startsWith("/uploads/") || 
               path.startsWith("/static/") ||
               path.startsWith("/favicon.ico");
    }
}
