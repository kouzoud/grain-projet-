import { useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';

/**
 * Hook personnalisé pour gérer les notifications en temps réel via SSE
 * @param {boolean} enabled - Activer ou désactiver les notifications
 * @returns {Object} - { isConnected, reconnect }
 */
export const useNotifications = (enabled = true) => {
  const { addToast } = useToast();
  const { t } = useTranslation();
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found');
      return;
    }

    const connectSSE = () => {
      // Nettoyer la connexion existante
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Détection automatique de l'environnement
      const BASE_URL = import.meta.env.PROD 
        ? "/api"                       // Production: chemin relatif (Nginx gère le reste)
        : "http://localhost:8080/api"; // Local: URL complète vers le serveur Java
      
      // EventSource ne supporte pas les headers custom, on passe le token dans l'URL
      const eventSource = new EventSource(`${BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`, {
        withCredentials: true,
      });

      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('✅ Connected to notification stream');
        isConnectedRef.current = true;
      };

      eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error);
        isConnectedRef.current = false;
        eventSource.close();

        // Reconnexion automatique après 5 secondes
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connectSSE();
        }, 5000);
      };

      // Événement : nouveau cas créé
      eventSource.addEventListener('case_created', (event) => {
        const message = event.data;
        addToast({
          message: message || t('notifications.caseCreated'),
          type: 'success',
        });
      });

      // Événement : cas mis à jour
      eventSource.addEventListener('case_updated', (event) => {
        const message = event.data;
        addToast({
          message: message || t('notifications.caseUpdated'),
          type: 'info',
        });
      });

      // Événement : intervention confirmée
      eventSource.addEventListener('intervention_confirmed', (event) => {
        const message = event.data;
        addToast({
          message: message || t('notifications.interventionConfirmed'),
          type: 'success',
        });
      });

      // Événement : cas résolu
      eventSource.addEventListener('case_resolved', (event) => {
        const message = event.data;
        addToast({
          message: message || t('notifications.caseResolved'),
          type: 'success',
        });
      });

      // Événement : message générique
      eventSource.addEventListener('message', (event) => {
        const message = event.data;
        if (message) {
          addToast({
            message,
            type: 'info',
          });
        }
      });
    };

    connectSSE();

    // Cleanup
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        isConnectedRef.current = false;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [enabled, addToast, t]);

  const reconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    // Déclencher une reconnexion
    const token = localStorage.getItem('token');
    if (token && enabled) {
      const connectSSE = () => {
        // Détection automatique de l'environnement
        const BASE_URL = import.meta.env.PROD 
          ? "/api"                       // Production: chemin relatif
          : "http://localhost:8080/api"; // Local: URL complète
        
        const eventSource = new EventSource(`${BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`, {
          withCredentials: true,
        });
        eventSourceRef.current = eventSource;
        isConnectedRef.current = true;
      };
      connectSSE();
    }
  };

  return {
    isConnected: isConnectedRef.current,
    reconnect,
  };
};
