import { useState } from 'react';
import { useForm } from 'react-hook-form';
import authService from '../services/authService';

export const useRegisterForm = () => {
    const [role, setRole] = useState('CITIZEN'); // 'CITIZEN' or 'VOLUNTEER'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [step, setStep] = useState(1); // For multi-step form if needed

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isValid },
        trigger,
        setValue
    } = useForm({
        mode: 'onChange'
    });

    const password = watch('password');

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);

        try {
            // Handle file upload
            let documentUrl = null;
            let documentType = null;

            if (data.document && data.document.length > 0) {
                try {
                    const file = data.document[0];
                    const filename = await authService.uploadFile(file);
                    documentUrl = filename;
                    documentType = "CNI"; // Default type
                } catch (uploadError) {
                    console.error('File upload failed:', uploadError);
                    throw new Error("Erreur lors de l'upload du document. Veuillez réessayer.");
                }
            } else if (role === 'VOLUNTEER') {
                // Force document upload for volunteers if not handled by validation
                // throw new Error("Le document d'identité est obligatoire pour les bénévoles.");
            }

            const registerData = {
                nom: data.lastName,
                prenom: data.firstName,
                email: data.email,
                password: data.password,
                telephone: data.phone,
                role: role === 'CITIZEN' ? 'CITOYEN' : 'BENEVOLE',
                competences: role === 'VOLUNTEER' ? data.skills : null,
                disponibilite: role === 'VOLUNTEER' ? data.availability : null,
                documentUrl,
                documentType
            };

            await authService.register(registerData);
            setIsSuccess(true);

        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || err.message || "Une erreur est survenue lors de l'inscription.");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        role,
        setRole,
        isLoading,
        error,
        isSuccess,
        step,
        setStep,
        register,
        handleSubmit,
        errors,
        isValid,
        watch,
        trigger,
        setValue,
        onSubmit: handleSubmit(onSubmit),
        passwordValue: password
    };
};
