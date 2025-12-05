import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, MapPin } from 'lucide-react';
import LocationPicker from '../../components/LocationPicker';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import casService from '../../services/casService';

const DeclarationForm = () => {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [isCertified, setIsCertified] = useState(false);
    const isEditMode = !!id;

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [existingPhotos, setExistingPhotos] = useState([]);

    useEffect(() => {
        if (isEditMode) {
            const fetchCase = async () => {
                try {
                    const data = await casService.getCaseById(id);
                    setValue('title', data.titre);
                    setValue('description', data.description);
                    setValue('category', data.categorie);
                    setLocation({ lat: data.latitude, lng: data.longitude });

                    if (data.photos) {
                        setExistingPhotos(data.photos);
                    }
                } catch (error) {
                    console.error("Failed to fetch case", error);
                    alert("Impossible de charger la demande.");
                    navigate('/citizen/dashboard');
                }
            };
            fetchCase();
        }
    }, [id, isEditMode, setValue, navigate]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (selectedFiles.length + files.length + existingPhotos.length > 4) {
            alert("Vous ne pouvez ajouter que 4 photos maximum (existantes + nouvelles).");
            return;
        }

        const newFiles = [...selectedFiles, ...files];
        setSelectedFiles(newFiles);

        // Generate previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newPreviews]);
    };

    const removeFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);

        const newPreviews = previewUrls.filter((_, i) => i !== index);
        URL.revokeObjectURL(previewUrls[index]);
        setPreviewUrls(newPreviews);
    };

    const removeExistingFile = (index) => {
        const newExisting = existingPhotos.filter((_, i) => i !== index);
        setExistingPhotos(newExisting);
    };

    const onSubmit = async (data) => {
        if (!location) {
            alert("Veuillez sélectionner une position sur la carte.");
            return;
        }

        setIsLoading(true);
        try {
            const casRequest = {
                titre: data.title,
                description: data.description,
                categorie: data.category,
                latitude: location.lat,
                longitude: location.lng,
                photos: selectedFiles,
                existingPhotos: existingPhotos
            };

            if (isEditMode) {
                await casService.updateCase(id, casRequest);
            } else {
                await casService.createCase(casRequest);
            }

            navigate('/citizen/dashboard');

        } catch (error) {
            console.error('Operation failed', error);
            alert("Erreur lors de l'enregistrement.");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to get full URL for existing photos
    const getFullImageUrl = (filename) => {
        if (filename.startsWith('http')) return filename;
        return `http://localhost:8080/api/uploads/${filename}`;
    };

    return (
        <div className="min-h-screen bg-page p-6">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary-dark mb-2">
                        {isEditMode ? "Modifier la Demande" : "Nouvelle Demande d'Aide"}
                    </h1>
                    <p className="text-secondary">
                        {isEditMode ? "Mettez à jour les informations de votre demande." : "Détaillez votre besoin pour alerter les bénévoles à proximité."}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Titre de la demande</label>
                        <Input
                            placeholder="Ex: Besoin de denrées alimentaires"
                            {...register('title', { required: 'Titre requis' })}
                            error={errors.title}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Catégorie</label>
                        <select
                            className="w-full px-4 py-2 border border-secondary-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                            {...register('category', { required: 'Catégorie requise' })}
                        >
                            <option value="">Sélectionner une catégorie</option>
                            <option value="ALIMENTAIRE">Alimentaire</option>
                            <option value="MEDICAL">Médical</option>
                            <option value="LOGISTIQUE">Logistique</option>
                            <option value="AUTRE">Autre</option>
                        </select>
                        {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Description détaillée</label>
                        <textarea
                            className="w-full px-4 py-2 border border-secondary-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white h-32 resize-none"
                            placeholder="Décrivez votre situation et vos besoins spécifiques..."
                            {...register('description', { required: 'Description requise' })}
                        ></textarea>
                        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
                    </div>

                    <div className="w-full flex flex-col gap-2">
                        <label className="block text-sm font-medium text-secondary">Où se trouve le besoin ?</label>
                        <div className="h-[400px] w-full relative z-0 rounded-lg overflow-hidden border border-gray-300">
                            <LocationPicker
                                onLocationSelect={(loc) => setLocation(loc)}
                                initialLocation={location}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Photos (Max 4)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50">
                            <input
                                type="file"
                                id="photos"
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                disabled={selectedFiles.length + existingPhotos.length >= 4}
                            />
                            <label htmlFor="photos" className={`cursor-pointer flex flex-col items-center ${selectedFiles.length + existingPhotos.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <Upload className="w-8 h-8 text-secondary mb-2" />
                                <span className="text-sm text-gray-500">
                                    {selectedFiles.length + existingPhotos.length >= 4 ? "Limite de 4 photos atteinte" : "Ajouter des photos"}
                                </span>
                            </label>
                        </div>

                        {/* Previews */}
                        {(previewUrls.length > 0 || existingPhotos.length > 0) && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                {/* Existing Photos */}
                                {existingPhotos.map((filename, index) => (
                                    <div key={`existing-${index}`} className="relative w-full aspect-square rounded-lg overflow-hidden border border-blue-200">
                                        <img src={getFullImageUrl(filename)} alt={`Existing ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingFile(index)}
                                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg hover:bg-red-600 transition-colors"
                                        >
                                            <span className="text-xs font-bold">X</span>
                                        </button>
                                        <span className="absolute bottom-0 left-0 bg-blue-500 text-white text-[10px] px-1">Existante</span>
                                    </div>
                                ))}

                                {/* New Photos */}
                                {previewUrls.map((url, index) => (
                                    <div key={`new-${index}`} className="relative w-full aspect-square rounded-lg overflow-hidden border border-green-200">
                                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg hover:bg-red-600 transition-colors"
                                        >
                                            <span className="text-xs font-bold">X</span>
                                        </button>
                                        <span className="absolute bottom-0 left-0 bg-green-500 text-white text-[10px] px-1">Nouvelle</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="certify"
                            className="mt-1 h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                            checked={isCertified}
                            onChange={(e) => setIsCertified(e.target.checked)}
                        />
                        <label htmlFor="certify" className="text-sm text-gray-700 cursor-pointer">
                            Je certifie sur l'honneur que les informations renseignées sont exactes et que cette demande d'aide est réelle. Je comprends que toute fausse déclaration pourra entraîner la suspension de mon compte.
                        </label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 mt-8">
                        <Button type="button" variant="outline" onClick={() => navigate('/citizen/dashboard')}>
                            Annuler
                        </Button>
                        <Button type="submit" isLoading={isLoading} disabled={!isCertified} className={!isCertified ? 'opacity-50 cursor-not-allowed' : ''}>
                            {isEditMode ? "Mettre à jour" : "Publier la demande"}
                        </Button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default DeclarationForm;
