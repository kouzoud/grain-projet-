import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import casService from '../../services/casService';
import { CheckCircle, MapPin, Calendar, AlertCircle, Clock, Filter } from 'lucide-react';
import { defaultImage, getSingleImageUrl } from '../../utils/imageUtils';
import SocialShareButton from '../../components/common/SocialShareButton';

const MyInterventions = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('EN_COURS'); // 'ALL', 'EN_COURS', 'RESOLU'

    useEffect(() => {
        fetchInterventions();
    }, []);

    const fetchInterventions = async () => {
        try {
            const data = await casService.getMyInterventions();
            setInterventions(data);
        } catch (error) {
            console.error("Failed to fetch interventions", error);
        } finally {
            setLoading(false);
        }
    };

    // Filtrer et trier les interventions
    const filteredInterventions = useMemo(() => {
        let filtered = [...interventions];
        
        // Appliquer le filtre de statut
        if (activeFilter === 'EN_COURS') {
            filtered = filtered.filter(cas => cas.statut !== 'RESOLU');
        } else if (activeFilter === 'RESOLU') {
            filtered = filtered.filter(cas => cas.statut === 'RESOLU');
        }
        
        // Trier: En cours en premier, puis par date (plus récent d'abord)
        filtered.sort((a, b) => {
            // Priorité aux missions en cours
            if (a.statut === 'RESOLU' && b.statut !== 'RESOLU') return 1;
            if (a.statut !== 'RESOLU' && b.statut === 'RESOLU') return -1;
            // Puis par date (plus récent en premier)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        return filtered;
    }, [interventions, activeFilter]);

    // Compter les interventions par statut
    const counts = useMemo(() => {
        const enCours = interventions.filter(cas => cas.statut !== 'RESOLU').length;
        const resolu = interventions.filter(cas => cas.statut === 'RESOLU').length;
        return { all: interventions.length, enCours, resolu };
    }, [interventions]);

    const handleResolve = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir marquer ce cas comme résolu ? Cette action est irréversible.")) {
            try {
                await casService.resolveCase(id);
                fetchInterventions(); // Refresh list
            } catch (error) {
                console.error("Failed to resolve case", error);
                alert("Erreur lors de la clôture du cas.");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <CheckCircle className="w-8 h-8 text-cyan-500" />
                    {t('volunteer.missions.title', 'Mes Missions')}
                </h1>
                
                {/* Filtres */}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveFilter('ALL')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeFilter === 'ALL'
                                ? 'bg-cyan-500 text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {t('common.all', 'Tous')}
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white/20">
                            {counts.all}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveFilter('EN_COURS')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                            activeFilter === 'EN_COURS'
                                ? 'bg-amber-500 text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        <Clock className="w-4 h-4" />
                        {t('volunteer.missions.inProgress', 'En cours')}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                            activeFilter === 'EN_COURS' ? 'bg-white/20' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400'
                        }`}>
                            {counts.enCours}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveFilter('RESOLU')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                            activeFilter === 'RESOLU'
                                ? 'bg-green-500 text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        <CheckCircle className="w-4 h-4" />
                        {t('volunteer.missions.resolved', 'Résolus')}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                            activeFilter === 'RESOLU' ? 'bg-white/20' : 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400'
                        }`}>
                            {counts.resolu}
                        </span>
                    </button>
                </div>
            </div>

            {filteredInterventions.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <AlertCircle className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                        {activeFilter === 'EN_COURS' 
                            ? t('volunteer.missions.noInProgress', 'Aucune mission en cours.')
                            : activeFilter === 'RESOLU'
                            ? t('volunteer.missions.noResolved', 'Aucune mission résolue.')
                            : t('volunteer.missions.noMissions', 'Vous n\'avez aucune mission.')}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInterventions.map((cas) => (
                        <div key={cas.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={getSingleImageUrl(cas.photos?.[0]) || defaultImage}
                                    alt={cas.titre}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                                />
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                                        cas.statut === 'RESOLU' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' 
                                            : cas.statut === 'PRIS_EN_CHARGE' 
                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400' 
                                            : 'bg-gray-100 text-gray-800 dark:bg-slate-600 dark:text-gray-300'
                                    }`}>
                                        {cas.statut === 'RESOLU' 
                                            ? t('status.resolved', 'RÉSOLU')
                                            : cas.statut === 'PRIS_EN_CHARGE'
                                            ? t('status.inProgress', 'EN COURS')
                                            : cas.statut}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{cas.titre}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{cas.description}</p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <MapPin className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 text-cyan-500" />
                                        <span>{cas.latitude.toFixed(4)}, {cas.longitude.toFixed(4)}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 text-cyan-500" />
                                        <span>{new Date(cas.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {/* Social Share Button - Masqué si RESOLU */}
                                    {cas.statut !== 'RESOLU' && cas.status !== 'RESOLU' && (
                                        <SocialShareButton
                                            title={cas.titre}
                                            description={cas.description}
                                            caseId={cas.id}
                                            showLabel={false}
                                            className="px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-colors flex items-center justify-center"
                                        />
                                    )}
                                    
                                    {cas.statut !== 'RESOLU' && cas.status !== 'RESOLU' && (
                                        <button
                                            onClick={() => handleResolve(cas.id)}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            {t('volunteer.missions.markResolved', 'Marquer comme Résolu')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyInterventions;
