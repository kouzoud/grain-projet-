import React from 'react';
import { Clock, MapPin, User, UserCheck } from 'lucide-react';
import SocialShareButton from '../common/SocialShareButton';

const KanbanCard = ({ request, onClick }) => {
    const getCategoryColor = (category) => {
        switch (category) {
            case 'MEDICAL': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'ALIMENTAIRE': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'LOGEMENT': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'VETEMENT': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return "Hier";
        return `Il y a ${diffDays} jours`;
    };

    return (
        <div
            onClick={() => onClick(request)}
            className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:bg-white dark:hover:bg-slate-800 hover:border-cyan-300 dark:hover:border-cyan-500/50 transition-all duration-300 shadow-sm hover:shadow-md group"
        >
            <div className="flex justify-between items-start mb-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${getCategoryColor(request.categorie)}`}>
                    {request.categorie}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(request.dateCreation)}
                </span>
            </div>

            <h4 className="text-gray-900 dark:text-gray-200 font-medium mb-2 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {request.titre}
            </h4>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-slate-700/50">
                <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[100px]">
                        {request.citoyenNom ? `${request.citoyenNom} ${request.citoyenPrenom?.charAt(0)}.` : 'Anonyme'}
                    </span>
                </div>
                {request.localisation && (
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Localisé</span>
                    </div>
                )}
            </div>

            {/* Volunteer Info for Intervention Column */}
            {['EN_COURS', 'PRIS_EN_CHARGE'].includes(request.statut) && request.volunteer && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-slate-700/50 flex items-center gap-2 text-xs font-medium text-violet-600 dark:text-purple-300 bg-violet-50 dark:bg-purple-500/10 p-2 rounded-lg border border-violet-200 dark:border-purple-500/20">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span className="truncate">
                        Pris par : {request.volunteer.prenom} {request.volunteer.nom}
                    </span>
                </div>
            )}
            
            {/* Social Share Button - Masqué si RESOLU */}
            {request.statut !== 'RESOLU' && request.status !== 'RESOLU' && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-slate-700/50" onClick={(e) => e.stopPropagation()}>
                    <SocialShareButton
                        title={request.titre}
                        description={request.description}
                        caseId={request.id}
                        showLabel={true}
                        className="w-full justify-center text-xs py-2 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-all"
                    />
                </div>
            )}
        </div>
    );
};

export default KanbanCard;
