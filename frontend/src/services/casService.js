import api from './api';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const casService = {
    createCase: async (caseData) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();

        // Appending simple fields
        formData.append('titre', caseData.titre);
        formData.append('description', caseData.description);
        formData.append('categorie', caseData.categorie);
        formData.append('latitude', caseData.latitude);
        formData.append('longitude', caseData.longitude);

        // Appending Files
        if (caseData.photos && caseData.photos.length > 0) {
            // Si c'est un FileList
            Array.from(caseData.photos).forEach(file => formData.append('photos', file));
        }

        // Force Headers
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data' // CRUCIAL
            }
        };

        return axios.post(`${API_URL}/cases`, formData, config);
    },

    /**
     * Get cases nearby
     * @param {number} latitude 
     * @param {number} longitude 
     * @param {number} radius in meters
     * @param {string} [categorie] optional
     */
    getCasesNearby: async (latitude, longitude, radius, categorie) => {
        const params = { latitude, longitude, radius };
        if (categorie) params.categorie = categorie;

        const response = await api.get('/cases/nearby', { params });
        return response.data;
    },

    getMyCases: async () => {
        const response = await api.get('/cases/me');
        return response.data;
    },

    getValidatedCases: async () => {
        const response = await api.get('/cases/validated');
        return response.data;
    },

    getAllCases: async () => {
        const response = await api.get('/cases');
        return response.data;
    },

    updateCase: async (id, caseData) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();

        formData.append('titre', caseData.titre);
        formData.append('description', caseData.description);
        formData.append('categorie', caseData.categorie);
        formData.append('latitude', caseData.latitude);
        formData.append('longitude', caseData.longitude);

        if (caseData.photos && caseData.photos.length > 0) {
            Array.from(caseData.photos).forEach(file => formData.append('photos', file));
        }

        if (caseData.existingPhotos && caseData.existingPhotos.length > 0) {
            caseData.existingPhotos.forEach(photo => formData.append('existingPhotos', photo));
        }

        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        };

        return axios.post(`${API_URL}/cases/${id}`, formData, config);
    },

    deleteCase: async (id) => {
        return api.delete(`/cases/${id}`);
    },

    getCaseById: async (id) => {
        const response = await api.get(`/cases/${id}`);
        return response.data;
    },

    takeCase: async (id, interventionData) => {
        return api.put(`/cases/${id}/take`, interventionData);
    },

    confirmIntervention: async (data) => {
        return api.post('/interventions/confirm', data);
    },

    getMyInterventions: async () => {
        const response = await api.get('/cases/my-interventions');
        return response.data;
    },

    resolveCase: async (id) => {
        return api.put(`/cases/${id}/resolve`);
    },

    getVolunteerStats: async () => {
        const response = await api.get('/volunteer/stats');
        return response.data;
    },
};

export default casService;
