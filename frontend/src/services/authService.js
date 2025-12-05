import api from './api';

const authService = {
    register: async (data) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/uploads', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // Returns the filename
    },

    login: async (data) => {
        const response = await api.post('/auth/login', data);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    getRole: () => {
        return localStorage.getItem('role');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};

export default authService;
