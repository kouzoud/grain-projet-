import api from './api';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const userService = {
    getProfile: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put('/users/me', profileData);
        return response.data;
    },

    changePassword: async (passwordData) => {
        return api.put('/users/me/password', passwordData);
    },

    uploadAvatar: async (file) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);

        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        };

        const response = await axios.post(`${API_URL}/users/me/avatar`, formData, config);
        return response.data;
    }
};

export default userService;
