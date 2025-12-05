import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, Activity, FileText, Camera, Save, AlertCircle, CheckCircle } from 'lucide-react';
import userService from '../../services/userService';
import { getSingleImageUrl, defaultImage } from '../../utils/imageUtils';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('info');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await userService.getProfile();
            setUser(data);
            setPreviewImage(getSingleImageUrl(data.photoUrl));
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
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil.' });
        }
    };

    const onChangePassword = async (data) => {
        if (data.newPassword !== data.confirmPassword) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
            return;
        }

        try {
            await userService.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            setMessage({ type: 'success', text: 'Mot de passe modifié avec succès !' });
            resetPassword();
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur : Mot de passe actuel incorrect.' });
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
            setUser(prev => ({ ...prev, photoUrl: filename }));
            setMessage({ type: 'success', text: 'Photo de profil mise à jour !' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: "Erreur lors de l'upload de la photo." });
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
                                <User className="w-5 h-5" /> Informations
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${activeTab === 'security' ? 'bg-gray-50 text-primary font-medium border-l-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Lock className="w-5 h-5" /> Sécurité
                            </button>
                            {user?.role === 'BENEVOLE' && (
                                <button
                                    onClick={() => setActiveTab('stats')}
                                    className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${activeTab === 'stats' ? 'bg-gray-50 text-primary font-medium border-l-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Activity className="w-5 h-5" /> Mes Statistiques
                                </button>
                            )}
                            {user?.role === 'CITOYEN' && (
                                <button
                                    onClick={() => setActiveTab('docs')}
                                    className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${activeTab === 'docs' ? 'bg-gray-50 text-primary font-medium border-l-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <FileText className="w-5 h-5" /> Mes Documents
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            {activeTab === 'info' && (
                                <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-6">Informations Personnelles</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                            <input {...register('prenom', { required: true })} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                            <input {...register('nom', { required: true })} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input {...register('email')} disabled className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                            <input {...register('telephone')} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" />
                                        </div>

                                        {user?.role === 'BENEVOLE' && (
                                            <>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Compétences</label>
                                                    <textarea {...register('competences')} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" rows="3" placeholder="Ex: Premiers secours, Logistique..." />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilité</label>
                                                    <input {...register('disponibilite')} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Ex: Weekends, Soirées..." />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                                            <Save className="w-4 h-4" /> Enregistrer
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'security' && (
                                <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-6 max-w-md">
                                    <h2 className="text-xl font-bold text-gray-800 mb-6">Changer le mot de passe</h2>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                                        <input type="password" {...registerPassword('currentPassword', { required: true })} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                                        <input type="password" {...registerPassword('newPassword', { required: true, minLength: 6 })} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" />
                                        {passwordErrors.newPassword && <span className="text-red-500 text-xs">Minimum 6 caractères</span>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                                        <input type="password" {...registerPassword('confirmPassword', { required: true })} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" />
                                    </div>
                                    <div className="pt-4">
                                        <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                                            <Save className="w-4 h-4" /> Mettre à jour
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'stats' && (
                                <div className="text-center py-12">
                                    <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">Statistiques à venir</h3>
                                    <p className="text-gray-500">Vos statistiques d'impact seront bientôt disponibles ici.</p>
                                </div>
                            )}

                            {activeTab === 'docs' && (
                                <div className="text-center py-12">
                                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                                    <p className="text-gray-500">Gestion de vos documents officiels (CNI, Justificatifs).</p>
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
