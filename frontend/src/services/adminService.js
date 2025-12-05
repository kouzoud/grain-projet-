import api from './api';

const adminService = {
    getPendingUsers: async () => {
        const response = await api.get('/admin/users/pending');
        console.log('[AdminService] getPendingUsers response:', response.data);
        return response.data;
    },

    validateUser: async (userId) => {
        await api.put(`/admin/users/${userId}/validate`);
    },

    rejectUser: async (userId) => {
        await api.put(`/admin/users/${userId}/reject`);
    },

    getAllUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },

    toggleUserBan: async (userId) => {
        await api.put(`/admin/users/${userId}/ban`);
    },

    getAllCases: async () => {
        const response = await api.get('/admin/cases');
        return response.data;
    },

    updateCaseStatus: async (caseId, status) => {
        await api.put(`/admin/cases/${caseId}/status`, null, {
            params: { status }
        });
    },

    deleteCase: async (caseId) => {
        await api.delete(`/admin/cases/${caseId}`);
    },

    getAllSignalements: async () => {
        const response = await api.get('/admin/signalements');
        return response.data;
    },

    closeSignalement: async (signalementId) => {
        await api.put(`/admin/signalements/${signalementId}/close`);
    },

    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },
};

export default adminService;
