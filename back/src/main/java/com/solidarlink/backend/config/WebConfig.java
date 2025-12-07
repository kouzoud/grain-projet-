package com.solidarlink.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .exposedHeaders("Content-Disposition");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Use absolute path to uploads directory relative to project root
        String projectRoot = System.getProperty("user.dir");
        // If running from 'back' directory, use current dir, otherwise add 'back'
        String uploadPath = projectRoot.endsWith("back") 
            ? "file:" + projectRoot + "/uploads/"
            : "file:" + projectRoot + "/back/uploads/";
        
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations(uploadPath);
    }
}
