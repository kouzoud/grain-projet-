import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        // Don't send token for auth endpoints
        if (config.url.includes('/auth/login') || config.url.includes('/auth/register')) {
            return config;
        }

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Optimized cache control: only disable cache for mutations
        const isMutation = ['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase());
        if (isMutation) {
            config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
            config.headers['Pragma'] = 'no-cache';
            config.headers['Expires'] = '0';
        } else {
            // GET requests: cache for 5 minutes for static content
            if (config.url.includes('/stats') || config.url.includes('/public')) {
                config.headers['Cache-Control'] = 'public, max-age=300'; // 5 min
            } else {
                // Cases and dynamic data: shorter cache
                config.headers['Cache-Control'] = 'private, max-age=60'; // 1 min
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors and show toast notifications
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Don't show toast for aborted requests
        if (error.name === 'AbortError' || error.name === 'CanceledError') {
            return Promise.reject(error);
        }

        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || error.response.data?.error;

            if (status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                toast.error('Session expirée. Veuillez vous reconnecter.');
            } else if (status === 403) {
                toast.error('Accès non autorisé');
            } else if (status === 404) {
                toast.error('Ressource non trouvée');
            } else if (status >= 500) {
                toast.error('Erreur serveur. Veuillez réessayer plus tard.');
            } else if (message) {
                toast.error(message);
            }
        } else if (error.request) {
            toast.error('Erreur de connexion. Vérifiez votre connexion internet.');
        }

        return Promise.reject(error);
    }
);

export default api;
