package com.solidarlink.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // Configuration CORS gérée par SecurityConfig
    // Serving des fichiers géré par FileController
}
