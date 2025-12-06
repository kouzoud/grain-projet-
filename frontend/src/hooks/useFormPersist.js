import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour persister les données d'un formulaire dans le localStorage
 * 
 * @param {string} key - Identifiant unique du formulaire dans le localStorage
 * @param {object} initialValues - Valeurs initiales du formulaire
 * @returns {object} - { values, handleChange, setFieldValue, clearForm }
 */
export const useFormPersist = (key, initialValues) => {
    // 1. Initialiser avec le stockage ou la valeur par défaut
    const [values, setValues] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValues;
        } catch (error) {
            console.warn(`Erreur lors du chargement des données du formulaire (${key}):`, error);
            return initialValues;
        }
    });

    // 2. Sauvegarder à chaque changement
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(values));
        } catch (error) {
            console.warn(`Erreur lors de la sauvegarde des données du formulaire (${key}):`, error);
        }
    }, [key, values]);

    // 3. Helper pour mettre à jour un champ (input standard)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));
    };
    
    // 4. Helper spécifique pour les fichiers ou champs complexes
    const setFieldValue = (name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    // 5. Nettoyage (après soumission réussie)
    const clearForm = () => {
        try {
            window.localStorage.removeItem(key);
            setValues(initialValues);
        } catch (error) {
            console.warn(`Erreur lors du nettoyage du formulaire (${key}):`, error);
        }
    };

    return { values, handleChange, setFieldValue, clearForm };
};
