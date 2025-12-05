import { useState } from 'react';
import casService from '../services/casService';

const useInterventionConfirmation = (onSuccess) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const confirmIntervention = async (casId, interventionData) => {
        setLoading(true);
        setError(null);
        try {
            await casService.confirmIntervention({
                casId,
                ...interventionData
            });
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Intervention confirmation failed:", err);
            setError(err.response?.data?.message || "Une erreur est survenue lors de la confirmation.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        confirmIntervention,
        loading,
        error
    };
};

export default useInterventionConfirmation;
