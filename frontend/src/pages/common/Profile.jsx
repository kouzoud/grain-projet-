import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { User, Lock, Activity, FileText, Camera, Save, AlertCircle, CheckCircle } from 'lucide-react';
import userService from '../../services/userService';
import { getSingleImageUrl, defaultImage } from '../../utils/imageUtils';

// Schéma de validation pour le changement de mot de passe
const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z.string()
        .optional()
        .or(z.literal(''))
        .superRefine((val, ctx) => {
            // Si le champ est vide, on arrête (valide, pas de changement de mdp)
            if (!val) return;

            // Si le champ contient quelque chose, on applique TOUTES les règles
            if (val.length < 8) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Le mot de passe doit contenir au moins 8 caractères",
                });
            }
            if (!/[A-Z]/.test(val)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Le mot de passe doit contenir au moins une majuscule",
                });
            }
            if (!/[a-z]/.test(val)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Le mot de passe doit contenir au moins une minuscule",
                });
            }
            if (!/[0-9]/.test(val)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Le mot de passe doit contenir au moins un chiffre",
                });
            }
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(val)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Le mot de passe doit contenir au moins un caractère spécial",
                });
            }
        }),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

const Profile = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('info');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { 
        register: registerPassword, 
        handleSubmit: handleSubmitPassword, 
        reset: resetPassword, 
        watch,
        formState: { errors: passwordErrors } 
    } = useForm({
        resolver: zodResolver(passwordSchema),
        mode: 'onChange' // Validation en temps réel
    });

    const newPassword = watch('newPassword', '');

    // Calcul de la force du mot de passe
    const getPasswordStrength = (password) => {
        if (!password) return { score: 0, label: '', color: '' };
        
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

        if (score <= 2) return { score, label: 'Faible', color: 'bg-red-500' };
        if (score === 3) return { score, label: 'Moyen', color: 'bg-yellow-500' };
        if (score === 4) return { score, label: 'Bon', color: 'bg-blue-500' };
        return { score, label: 'Excellent', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await userService.getProfile();
            setUser(data);
            setPreviewImage(getSingleImageUrl(data.avatarUrl));
            reset(data);
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setLoading(false);
        }
    };

    const onUpdateProfile = async (data) => {
        try {
            const updatedUser = await userService.updateProfile(data);
            setUser(updatedUser);
            setMessage({ type: 'success', text: t('profile.messages.profileUpdated') });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: t('profile.messages.profileUpdateError') });
        }
    };

    const onChangePassword = async (data) => {
        if (data.newPassword !== data.confirmPassword) {
            setMessage({ type: 'error', text: t('profile.messages.passwordMismatch') });
            return;
        }

        try {
            await userService.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            setMessage({ type: 'success', text: t('profile.messages.passwordChanged') });
            resetPassword();
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: t('profile.messages.passwordIncorrect') });
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload
        try {
            const filename = await userService.uploadAvatar(file);
            // Recharger le profil complet depuis le backend
            await fetchProfile();
            setMessage({ type: 'success', text: t('profile.messages.avatarUpdated') });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: t('profile.messages.avatarUploadError') });
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    const roleColor = user?.role === 'ADMIN' ? 'bg-cyan-600' : user?.role === 'BENEVOLE' ? 'bg-blue-600' : 'bg-green-600';

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header / Banner */}
            <div className={`${roleColor} h-48 w-full relative`}>
                <div className="absolute -bottom-16 left-8 flex items-end">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                            <img
                                src={previewImage || defaultImage}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                            />
                        </div>
                        <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors">
                            <Camera className="w-5 h-5 text-gray-600" />
                            <input
                                id="avatar-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                        </label>
                    </div>
                    <div className="ml-4 mb-2">
                        <h1 className="text-3xl font-bold text-gray-800">{user?.prenom} {user?.nom}</h1>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${roleColor} mt-1 shadow-sm`}>
                            {user?.role}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-24">
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {message.text}
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${activeTab === 'info' ? 'bg-gray-50 text-primary font-medium border-l-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <User className="w-5 h-5" /> {t('profile.tabs.info')}
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${activeTab === 'security' ? 'bg-gray-50 text-primary font-medium border-l-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Lock className="w-5 h-5" /> {t('profile.tabs.security')}
                            </button>
                            {user?.role === 'BENEVOLE' && (
                                <button
                                    onClick={() => setActiveTab('stats')}
                                    className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${activeTab === 'stats' ? 'bg-gray-50 text-primary font-medium border-l-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Activity className="w-5 h-5" /> {t('profile.tabs.stats')}
                                </button>
                            )}
                            {user?.role === 'CITOYEN' && (
                                <button
                                    onClick={() => setActiveTab('docs')}
                                    className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${activeTab === 'docs' ? 'bg-gray-50 text-primary font-medium border-l-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <FileText className="w-5 h-5" /> {t('profile.tabs.docs')}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            {activeTab === 'info' && (
                                <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-6">{t('profile.infoSection.title')}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.infoSection.firstName')}</label>
                                            <input {...register('prenom', { required: true })} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.infoSection.lastName')}</label>
                                            <input {...register('nom', { required: true })} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.infoSection.email')}</label>
                                            <input {...register('email')} disabled className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.infoSection.phone')}</label>
                                            <input {...register('telephone')} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" />
                                        </div>

                                        {user?.role === 'BENEVOLE' && (
                                            <>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.infoSection.skills')}</label>
                                                    <textarea {...register('competences')} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" rows="3" placeholder={t('profile.infoSection.skillsPlaceholder')} />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.infoSection.availability')}</label>
                                                    <input {...register('disponibilite')} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder={t('profile.infoSection.availabilityPlaceholder')} />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                                            <Save className="w-4 h-4" /> {t('profile.buttons.save')}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'security' && (
                                <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-6 max-w-md">
                                    <h2 className="text-xl font-bold text-gray-800 mb-6">{t('profile.securitySection.title')}</h2>
                                    
                                    {/* Current Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.securitySection.currentPassword')}</label>
                                        <input 
                                            type="password" 
                                            {...registerPassword('currentPassword')} 
                                            className={`w-full px-4 py-2 rounded-lg border ${passwordErrors.currentPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} focus:ring-2 focus:border-transparent transition-colors`}
                                        />
                                        {passwordErrors.currentPassword && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {passwordErrors.currentPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.securitySection.newPassword')}</label>
                                        <input 
                                            type="password" 
                                            {...registerPassword('newPassword')} 
                                            className={`w-full px-4 py-2 rounded-lg border ${passwordErrors.newPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} focus:ring-2 focus:border-transparent transition-colors`}
                                            placeholder="Laissez vide pour ne pas changer"
                                        />
                                        {passwordErrors.newPassword && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {passwordErrors.newPassword.message}
                                            </p>
                                        )}

                                        {/* Password Strength Indicator */}
                                        {newPassword && (
                                            <div className="mt-3 space-y-2">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-600">Force du mot de passe</span>
                                                    <span className={`font-semibold ${
                                                        passwordStrength.score <= 2 ? 'text-red-500' :
                                                        passwordStrength.score === 3 ? 'text-yellow-500' :
                                                        passwordStrength.score === 4 ? 'text-blue-500' : 'text-green-500'
                                                    }`}>{passwordStrength.label}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((level) => (
                                                        <div 
                                                            key={level}
                                                            className={`h-1.5 flex-1 rounded-full transition-all ${
                                                                level <= passwordStrength.score 
                                                                    ? passwordStrength.color 
                                                                    : 'bg-gray-200'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                
                                                {/* Validation Checklist */}
                                                <div className="space-y-1 pt-2">
                                                    <div className={`flex items-center gap-2 text-xs ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                                                        <CheckCircle className="w-3 h-3" />
                                                        <span>8 caractères min.</span>
                                                    </div>
                                                    <div className={`flex items-center gap-2 text-xs ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                                                        <CheckCircle className="w-3 h-3" />
                                                        <span>1 majuscule</span>
                                                    </div>
                                                    <div className={`flex items-center gap-2 text-xs ${/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                                                        <CheckCircle className="w-3 h-3" />
                                                        <span>1 chiffre</span>
                                                    </div>
                                                    <div className={`flex items-center gap-2 text-xs ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                                                        <CheckCircle className="w-3 h-3" />
                                                        <span>1 caractère spécial</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.securitySection.confirmPassword')}</label>
                                        <input 
                                            type="password" 
                                            {...registerPassword('confirmPassword')} 
                                            className={`w-full px-4 py-2 rounded-lg border ${passwordErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} focus:ring-2 focus:border-transparent transition-colors`}
                                        />
                                        {passwordErrors.confirmPassword && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {passwordErrors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-4">
                                        <button 
                                            type="submit" 
                                            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={Object.keys(passwordErrors).length > 0}
                                        >
                                            <Save className="w-4 h-4" /> {t('profile.buttons.update')}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'stats' && (
                                <div className="text-center py-12">
                                    <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">{t('profile.statsSection.title')}</h3>
                                    <p className="text-gray-500">{t('profile.statsSection.description')}</p>
                                </div>
                            )}

                            {activeTab === 'docs' && (
                                <div className="text-center py-12">
                                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">{t('profile.docsSection.title')}</h3>
                                    <p className="text-gray-500">{t('profile.docsSection.description')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
