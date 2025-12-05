import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, MapPin, FileText, Check, ChevronRight, ChevronLeft,
    X, Image, Sparkles, Save, Eye, Send, AlertCircle, Lightbulb,
    Navigation, Clock, Heart, Package, Stethoscope, Truck, HelpCircle,
    Camera, Trash2, GripVertical, CheckCircle2, Info
} from 'lucide-react';
import LocationPicker from '../../components/LocationPicker';
import Button from '../../components/ui/Button';
import casService from '../../services/casService';

// ==================== CONSTANTS ====================
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;

const CATEGORIES = [
    { value: 'ALIMENTAIRE', label: 'Alimentaire', icon: Package, color: 'from-orange-400 to-orange-600', keywords: ['nourriture', 'alimentaire', 'repas', 'manger', 'faim', 'provisions', 'denrées', 'courses', 'épicerie'] },
    { value: 'MEDICAL', label: 'Médical', icon: Stethoscope, color: 'from-red-400 to-red-600', keywords: ['médical', 'santé', 'médicament', 'docteur', 'hôpital', 'urgence', 'soins', 'maladie', 'blessure'] },
    { value: 'LOGISTIQUE', label: 'Logistique', icon: Truck, color: 'from-blue-400 to-blue-600', keywords: ['transport', 'déménagement', 'livraison', 'véhicule', 'déplacement', 'logistique', 'aide', 'porter'] },
    { value: 'AUTRE', label: 'Autre', icon: HelpCircle, color: 'from-gray-400 to-gray-600', keywords: [] }
];

const DESCRIPTION_TEMPLATES = [
    {
        id: 'alimentaire',
        title: 'Aide alimentaire',
        icon: Package,
        template: `🍽️ Type de besoin alimentaire :
- Denrées de base (riz, pâtes, huile...)
- Produits frais
- Plats préparés

👥 Nombre de personnes concernées : 

📅 Fréquence du besoin :
- Ponctuel
- Régulier (préciser)

⚠️ Allergies ou restrictions alimentaires :`
    },
    {
        id: 'medical',
        title: 'Assistance médicale',
        icon: Stethoscope,
        template: `🏥 Type d'assistance médicale :
- Accompagnement médical
- Aide à la mobilité
- Récupération de médicaments

📋 Détails de la situation :

🕐 Urgence :
- Immédiate
- Dans les 24h
- Cette semaine

📞 Contact d'urgence :`
    },
    {
        id: 'logistique',
        title: 'Aide logistique',
        icon: Truck,
        template: `🚗 Type d'aide logistique :
- Transport de personnes
- Transport de matériel
- Aide au déménagement

📦 Détails (poids, volume, distance) :

📅 Date souhaitée :

📍 Trajet prévu :
- Départ :
- Arrivée :`
    },
    {
        id: 'custom',
        title: 'Description libre',
        icon: FileText,
        template: ''
    }
];

const STEPS = [
    { id: 1, title: 'Informations', icon: FileText },
    { id: 2, title: 'Description', icon: Sparkles },
    { id: 3, title: 'Localisation', icon: MapPin },
    { id: 4, title: 'Photos', icon: Camera }
];

// ==================== ANIMATIONS ====================
const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
    hover: { scale: 1.02, transition: { duration: 0.2 } }
};

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
};

// ==================== SUB-COMPONENTS ====================
const ProgressBar = ({ currentStep, steps }) => (
    <div className="mb-8">
        <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-slate-700 -z-10" />
            <motion.div
                className="absolute top-5 left-0 h-1 bg-gradient-to-r from-cyan-500 to-violet-500 -z-10"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
            />

            {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                    <div key={step.id} className="flex flex-col items-center z-10">
                        <motion.div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                    ? 'bg-gradient-to-r from-cyan-500 to-violet-500 border-transparent text-white'
                                    : isCurrent
                                        ? 'bg-white dark:bg-slate-800 border-cyan-500 text-cyan-500'
                                        : 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500'
                                }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                        </motion.div>
                        <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-500 dark:text-slate-400'
                            }`}>
                            {step.title}
                        </span>
                    </div>
                );
            })}
        </div>
    </div>
);

const CharacterCounter = ({ current, max, warningThreshold = 0.8 }) => {
    const percentage = current / max;
    const isWarning = percentage >= warningThreshold;
    const isError = percentage >= 1;

    return (
        <div className={`text-xs font-medium transition-colors ${isError ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-gray-400 dark:text-slate-500'
            }`}>
            {current} / {max}
        </div>
    );
};

const CategorySuggestion = ({ suggestedCategory, onSelect }) => (
    <AnimatePresence>
        {suggestedCategory && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
            >
                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-cyan-50 to-violet-50 dark:from-cyan-900/20 dark:to-violet-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                    <Lightbulb className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-slate-300">
                        Suggestion : <strong>{suggestedCategory.label}</strong>
                    </span>
                    <button
                        type="button"
                        onClick={() => onSelect(suggestedCategory.value)}
                        className="ml-auto text-xs bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1 rounded-full transition-colors"
                    >
                        Appliquer
                    </button>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

const CategoryCard = ({ category, isSelected, onClick }) => {
    const Icon = category.icon;

    return (
        <motion.button
            type="button"
            onClick={onClick}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${isSelected
                    ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-violet-50 dark:from-cyan-900/30 dark:to-violet-900/30'
                    : 'border-gray-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700 bg-white dark:bg-slate-800'
                }`}
            variants={cardVariants}
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
        >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center mb-3 mx-auto`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <span className={`text-sm font-medium ${isSelected ? 'text-cyan-700 dark:text-cyan-300' : 'text-gray-700 dark:text-slate-300'
                }`}>
                {category.label}
            </span>
            {isSelected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center"
                >
                    <Check className="w-4 h-4 text-white" />
                </motion.div>
            )}
        </motion.button>
    );
};

const TemplateCard = ({ template, isSelected, onClick }) => {
    const Icon = template.icon;

    return (
        <motion.button
            type="button"
            onClick={onClick}
            className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-gray-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 bg-white dark:bg-slate-800'
                }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${isSelected ? 'bg-violet-500' : 'bg-gray-100 dark:bg-slate-700'
                    } flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-500 dark:text-slate-400'}`} />
                </div>
                <span className={`font-medium ${isSelected ? 'text-violet-700 dark:text-violet-300' : 'text-gray-700 dark:text-slate-300'
                    }`}>
                    {template.title}
                </span>
            </div>
        </motion.button>
    );
};

const PhotoUploadZone = ({ files, existingPhotos, onFilesAdd, onFileRemove, onExistingRemove, maxFiles = 4 }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [previewUrls, setPreviewUrls] = useState([]);
    const totalPhotos = files.length + existingPhotos.length;
    const canAddMore = totalPhotos < maxFiles;

    // Allowed MIME types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    // Generate preview URLs when files change
    useEffect(() => {
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);

        // Cleanup function to revoke URLs
        return () => {
            urls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [files]);

    const validateAndFilterFiles = (fileList) => {
        return fileList.filter(file => {
            const isValidType = allowedTypes.includes(file.type);
            if (!isValidType) {
                console.warn(`File ${file.name} rejected: invalid type ${file.type}`);
            }
            return isValidType;
        });
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (!canAddMore) return;

        const droppedFiles = Array.from(e.dataTransfer.files);
        const validFiles = validateAndFilterFiles(droppedFiles);
        const availableSlots = maxFiles - totalPhotos;
        
        if (validFiles.length === 0 && droppedFiles.length > 0) {
            alert("Format de fichier non supporté. Utilisez JPG, PNG, WebP ou GIF.");
            return;
        }
        
        onFilesAdd(validFiles.slice(0, availableSlots));
    }, [canAddMore, maxFiles, totalPhotos, onFilesAdd]);

    const handleFileInput = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = validateAndFilterFiles(selectedFiles);
        const availableSlots = maxFiles - totalPhotos;
        
        if (validFiles.length === 0 && selectedFiles.length > 0) {
            alert("Format de fichier non supporté. Utilisez JPG, PNG, WebP ou GIF.");
            e.target.value = '';
            return;
        }
        
        onFilesAdd(validFiles.slice(0, availableSlots));
        e.target.value = '';
    };

    const getFullImageUrl = (filename) => {
        if (filename.startsWith('http')) return filename;
        return `http://localhost:8080/api/uploads/${filename}`;
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <motion.div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${isDragOver
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                        : canAddMore
                            ? 'border-gray-300 dark:border-slate-600 hover:border-cyan-400 dark:hover:border-cyan-600 bg-gray-50 dark:bg-slate-800/50'
                            : 'border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 opacity-60 cursor-not-allowed'
                    }`}
                whileHover={canAddMore ? { scale: 1.01 } : {}}
            >
                <input
                    type="file"
                    id="photo-upload"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileInput}
                    disabled={!canAddMore}
                />
                <label htmlFor="photo-upload" className={`cursor-pointer ${!canAddMore ? 'cursor-not-allowed' : ''}`}>
                    <motion.div
                        animate={isDragOver ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                        className="inline-block"
                    >
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-100 to-violet-100 dark:from-cyan-900/40 dark:to-violet-900/40 flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                        </div>
                    </motion.div>
                    <p className="text-gray-700 dark:text-slate-300 font-medium mb-1">
                        {isDragOver ? 'Déposez les photos ici' : 'Glissez-déposez vos photos'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                        ou <span className="text-cyan-600 dark:text-cyan-400 underline">parcourez vos fichiers</span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                        {totalPhotos} / {maxFiles} photos • JPG, PNG, WebP
                    </p>
                </label>
            </motion.div>

            {/* Photo Previews */}
            {(files.length > 0 || existingPhotos.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {/* Existing Photos */}
                    {existingPhotos.map((filename, index) => (
                        <div
                            key={`existing-${index}`}
                            className="relative group aspect-square rounded-xl overflow-hidden border-2 border-blue-200 dark:border-blue-800 shadow-lg bg-gray-100 dark:bg-slate-700"
                        >
                            <img
                                src={getFullImageUrl(filename)}
                                alt={`Existing ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => onExistingRemove(index)}
                                    className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <span className="absolute bottom-2 left-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full z-10">
                                Existante
                            </span>
                        </div>
                    ))}

                    {/* New Photos */}
                    {files.map((file, index) => (
                        <div
                            key={`new-${index}-${file.name}`}
                            className="relative group aspect-square rounded-xl overflow-hidden border-2 border-green-200 dark:border-green-800 shadow-lg bg-gray-100 dark:bg-slate-700"
                        >
                            <img
                                src={previewUrls[index] || ''}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => onFileRemove(index)}
                                    className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <span className="absolute bottom-2 left-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full z-10">
                                Nouvelle
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CertificationSection = ({ certifications, onChange }) => (
    <motion.div
        className="p-6 bg-gradient-to-r from-cyan-50 to-violet-50 dark:from-cyan-900/20 dark:to-violet-900/20 rounded-2xl border border-cyan-200 dark:border-cyan-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Certification et engagement</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Veuillez confirmer les informations suivantes</p>
            </div>
        </div>

        <div className="space-y-3">
            {[
                { id: 'accuracy', label: "Je certifie que les informations fournies sont exactes et véridiques" },
                { id: 'realNeed', label: "Cette demande correspond à un besoin réel et actuel" },
                { id: 'terms', label: "J'accepte les conditions d'utilisation et la politique de confidentialité" }
            ].map((item) => (
                <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                        <input
                            type="checkbox"
                            checked={certifications[item.id]}
                            onChange={(e) => onChange(item.id, e.target.checked)}
                            className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${certifications[item.id]
                                ? 'bg-cyan-500 border-cyan-500'
                                : 'border-gray-300 dark:border-slate-600 group-hover:border-cyan-400'
                            }`}>
                            {certifications[item.id] && <Check className="w-3 h-3 text-white" />}
                        </div>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-slate-300">{item.label}</span>
                </label>
            ))}
        </div>
    </motion.div>
);

// ==================== MAIN COMPONENT ====================
const DeclarationForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    // Form state
    const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            category: '',
            description: ''
        }
    });

    const watchTitle = watch('title', '');
    const watchDescription = watch('description', '');
    const watchCategory = watch('category', '');

    // Component state
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [location, setLocation] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [existingPhotos, setExistingPhotos] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [certifications, setCertifications] = useState({
        accuracy: false,
        realNeed: false,
        terms: false
    });
    const [showPreview, setShowPreview] = useState(false);

    // Calculate suggested category based on title
    const suggestedCategory = useMemo(() => {
        if (!watchTitle || watchCategory) return null;
        const titleLower = watchTitle.toLowerCase();
        for (const cat of CATEGORIES) {
            if (cat.keywords.some(keyword => titleLower.includes(keyword))) {
                return cat;
            }
        }
        return null;
    }, [watchTitle, watchCategory]);

    // Load existing case data for edit mode
    useEffect(() => {
        if (isEditMode) {
            const fetchCase = async () => {
                try {
                    const data = await casService.getCaseById(id);
                    setValue('title', data.titre);
                    setValue('description', data.description);
                    setValue('category', data.categorie);
                    setLocation({ lat: data.latitude, lng: data.longitude });
                    if (data.photos) setExistingPhotos(data.photos);
                } catch (error) {
                    console.error("Failed to fetch case", error);
                    navigate('/citizen/dashboard');
                }
            };
            fetchCase();
        }
    }, [id, isEditMode, setValue, navigate]);

    // Handle template selection
    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template.id);
        if (template.template) {
            setValue('description', template.template);
        }
    };

    // Handle file management
    const handleFilesAdd = (newFiles) => {
        setSelectedFiles(prev => [...prev, ...newFiles]);
    };

    const handleFileRemove = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleExistingRemove = (index) => {
        setExistingPhotos(prev => prev.filter((_, i) => i !== index));
    };

    // Handle certification changes
    const handleCertificationChange = (id, value) => {
        setCertifications(prev => ({ ...prev, [id]: value }));
    };

    // Navigation
    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    // Check if all certifications are complete
    const allCertified = Object.values(certifications).every(Boolean);

    // Save draft
    const saveDraft = async () => {
        setIsSavingDraft(true);
        try {
            const draft = {
                title: watchTitle,
                category: watchCategory,
                description: watchDescription,
                location,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('declarationDraft', JSON.stringify(draft));
            // Show success notification
            setTimeout(() => setIsSavingDraft(false), 1000);
        } catch (error) {
            console.error('Failed to save draft', error);
            setIsSavingDraft(false);
        }
    };

    // Form submission
    const onSubmit = async (data) => {
        if (!location) {
            alert("Veuillez sélectionner une position sur la carte.");
            return;
        }

        if (!allCertified) {
            alert("Veuillez confirmer toutes les certifications.");
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

            localStorage.removeItem('declarationDraft');
            navigate('/citizen/dashboard');
        } catch (error) {
            console.error('Operation failed', error);
            alert("Erreur lors de l'enregistrement.");
        } finally {
            setIsLoading(false);
        }
    };

    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <motion.div
                        key="step1"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="space-y-6"
                    >
                        {/* Title Input */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                                    Titre de votre demande *
                                </label>
                                <CharacterCounter current={watchTitle.length} max={MAX_TITLE_LENGTH} />
                            </div>
                            <input
                                type="text"
                                placeholder="Ex: Besoin urgent de denrées alimentaires"
                                maxLength={MAX_TITLE_LENGTH}
                                {...register('title', { required: 'Le titre est requis' })}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 ${errors.title
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20'
                                    } focus:outline-none focus:ring-4`}
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" /> {errors.title.message}
                                </p>
                            )}
                            <CategorySuggestion
                                suggestedCategory={suggestedCategory}
                                onSelect={(value) => setValue('category', value)}
                            />
                        </div>

                        {/* Category Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                                Catégorie de la demande *
                            </label>
                            <motion.div
                                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                            >
                                {CATEGORIES.map(category => (
                                    <CategoryCard
                                        key={category.value}
                                        category={category}
                                        isSelected={watchCategory === category.value}
                                        onClick={() => setValue('category', category.value)}
                                    />
                                ))}
                            </motion.div>
                            <input type="hidden" {...register('category', { required: 'La catégorie est requise' })} />
                            {errors.category && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" /> {errors.category.message}
                                </p>
                            )}
                        </div>
                    </motion.div>
                );

            case 2:
                return (
                    <motion.div
                        key="step2"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="space-y-6"
                    >
                        {/* Templates */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                                Choisissez un modèle (optionnel)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {DESCRIPTION_TEMPLATES.map(template => (
                                    <TemplateCard
                                        key={template.id}
                                        template={template}
                                        isSelected={selectedTemplate === template.id}
                                        onClick={() => handleTemplateSelect(template)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Description Textarea */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                                    Description détaillée *
                                </label>
                                <CharacterCounter current={watchDescription.length} max={MAX_DESCRIPTION_LENGTH} />
                            </div>
                            <textarea
                                placeholder="Décrivez votre situation et vos besoins en détail..."
                                maxLength={MAX_DESCRIPTION_LENGTH}
                                {...register('description', {
                                    required: 'La description est requise',
                                    minLength: { value: 50, message: 'Minimum 50 caractères requis' }
                                })}
                                className={`w-full h-64 px-4 py-3 rounded-xl border-2 transition-all duration-300 resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 ${errors.description
                                        ? 'border-red-500 focus:border-red-500'
                                        : 'border-gray-200 dark:border-slate-700 focus:border-cyan-500'
                                    } focus:outline-none focus:ring-4 focus:ring-cyan-500/20`}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" /> {errors.description.message}
                                </p>
                            )}
                            <p className="mt-2 text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                                <Info className="w-3 h-3" /> Plus votre description est précise, plus les bénévoles pourront vous aider efficacement
                            </p>
                        </div>
                    </motion.div>
                );

            case 3:
                return (
                    <motion.div
                        key="step3"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                                Localisation du besoin *
                            </label>
                            {location && (
                                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> Position sélectionnée
                                </span>
                            )}
                        </div>

                        <div className="h-[450px] w-full relative rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-slate-700 shadow-lg">
                            <LocationPicker
                                onLocationSelect={(loc) => setLocation(loc)}
                                initialLocation={location}
                            />
                        </div>

                        {location && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                            >
                                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <span className="text-sm text-green-700 dark:text-green-300">
                                    Coordonnées : {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                </span>
                            </motion.div>
                        )}
                    </motion.div>
                );

            case 4:
                return (
                    <motion.div
                        key="step4"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="space-y-6"
                    >
                        {/* Photo Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                                Photos (optionnel, max 4)
                            </label>
                            <PhotoUploadZone
                                files={selectedFiles}
                                existingPhotos={existingPhotos}
                                onFilesAdd={handleFilesAdd}
                                onFileRemove={handleFileRemove}
                                onExistingRemove={handleExistingRemove}
                            />
                        </div>

                        {/* Certifications */}
                        <CertificationSection
                            certifications={certifications}
                            onChange={handleCertificationChange}
                        />
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-cyan-900/10 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 mb-4 shadow-lg shadow-cyan-500/25">
                        <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {isEditMode ? 'Modifier la Demande' : 'Nouvelle Demande d\'Aide'}
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
                        {isEditMode
                            ? 'Mettez à jour les informations de votre demande'
                            : 'Détaillez votre besoin pour alerter les bénévoles à proximité'
                        }
                    </p>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-6 md:p-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* Progress Bar */}
                    <ProgressBar currentStep={currentStep} steps={STEPS} />

                    {/* Form Content */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <AnimatePresence mode="wait">
                            {renderStepContent()}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
                            <div className="flex gap-3 order-2 sm:order-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={saveDraft}
                                    disabled={isSavingDraft}
                                    className="gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSavingDraft ? 'Sauvegardé !' : 'Brouillon'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/citizen/dashboard')}
                                >
                                    Annuler
                                </Button>
                            </div>

                            <div className="flex gap-3 order-1 sm:order-2">
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prevStep}
                                        className="gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Précédent
                                    </Button>
                                )}

                                {currentStep < 4 ? (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        className="gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white border-0"
                                    >
                                        Suivant
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={!allCertified || isLoading}
                                        isLoading={isLoading}
                                        className={`gap-2 ${allCertified
                                                ? 'bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white border-0'
                                                : 'opacity-50 cursor-not-allowed bg-gray-300 dark:bg-slate-600'
                                            }`}
                                    >
                                        <Send className="w-4 h-4" />
                                        {isEditMode ? 'Mettre à jour' : 'Publier'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </motion.div>

                {/* Tips Section */}
                <motion.div
                    className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">Conseil</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                {currentStep === 1 && "Un titre clair et précis attire plus de bénévoles. Mentionnez le type d'aide recherché."}
                                {currentStep === 2 && "Détaillez votre situation : nombre de personnes, urgence, contraintes particulières..."}
                                {currentStep === 3 && "Indiquez précisément l'adresse où l'aide est nécessaire pour faciliter l'intervention."}
                                {currentStep === 4 && "Les photos aident les bénévoles à mieux comprendre votre situation et à se préparer."}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DeclarationForm;
