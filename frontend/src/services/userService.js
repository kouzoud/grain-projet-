import api from './api';

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
        const formData = new FormData();
        formData.append('file', file);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        const response = await api.post('/users/me/avatar', formData, config);
        return response.data;
    }
};

export default userService;
