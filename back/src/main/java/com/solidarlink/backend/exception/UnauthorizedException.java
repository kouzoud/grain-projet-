package com.solidarlink.backend.exception;

/**
 * Exception personnalisée pour les opérations non autorisées
 */
public class UnauthorizedException extends RuntimeException {
    
    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}
