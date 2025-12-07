package com.solidarlink.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuration pour les tâches asynchrones (@Async)
 * Crée un pool de threads dédié pour éviter les conflits avec le contexte HTTP
 */
@Configuration
@Slf4j
public class AsyncConfig implements AsyncConfigurer {

    @Bean(name = "taskExecutor")
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // Nombre de threads de base
        executor.setCorePoolSize(5);
        
        // Nombre maximum de threads
        executor.setMaxPoolSize(10);
        
        // Capacité de la file d'attente
        executor.setQueueCapacity(100);
        
        // Préfixe des noms de threads pour faciliter le debug
        executor.setThreadNamePrefix("Async-Notification-");
        
        // Attendre la fin des tâches lors du shutdown
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        
        // Gestionnaire de rejet : logger l'erreur
        executor.setRejectedExecutionHandler((runnable, threadPoolExecutor) -> 
            log.error("Task rejected from async executor - Queue full or executor shutdown")
        );
        
        executor.initialize();
        
        log.info("Async Executor initialized - CorePoolSize: {}, MaxPoolSize: {}, QueueCapacity: {}", 
                executor.getCorePoolSize(), 
                executor.getMaxPoolSize(), 
                executor.getQueueCapacity());
        
        return executor;
    }
}
