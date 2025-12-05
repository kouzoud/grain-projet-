import axios from 'axios';

const API_URL = 'http://localhost:8080/api/public';

const getStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats`);
        return response.data;
    } catch (error) {
        console.error("Error fetching public stats:", error);
        // Return fallback data in case of error
        return {
            volunteers: 0,
            missions: 0,
            cities: 0
        };
    }
};

const getImpactStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/impact`);
        return response.data;
    } catch (error) {
        console.error("Error fetching impact stats:", error);
        return {
            activeVolunteers: 0,
            volunteerGrowth: 0,
            coveredCities: 0,
            completedMissions: 0,
            successRate: 0
        };
    }
};

const getLatestResolvedCases = async () => {
    try {
        const response = await axios.get(`${API_URL}/cases/resolved`);
        return response.data;
    } catch (error) {
        console.error("Error fetching resolved cases:", error);
        return [];
    }
};

const publicService = {
    getStats,
    getImpactStats,
    getLatestResolvedCases
};

export default publicService;
