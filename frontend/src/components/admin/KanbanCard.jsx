import React from 'react';
import { Clock, MapPin, User, UserCheck } from 'lucide-react';

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
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-800 hover:border-cyan-500/50 transition-all duration-300 shadow-sm hover:shadow-md group"
        >
            <div className="flex justify-between items-start mb-3">
                <span className={`text-xs font-medium px-2 py-1 rounded border ${getCategoryColor(request.categorie)}`}>
                    {request.categorie}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(request.dateCreation)}
                </span>
            </div>

            <h4 className="text-gray-200 font-medium mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                {request.titre}
            </h4>

            <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-700/50">
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
                <div className="mt-3 pt-2 border-t border-gray-700/50 flex items-center gap-2 text-xs font-medium text-purple-300 bg-purple-500/10 p-2 rounded-md border border-purple-500/20">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span className="truncate">
                        Pris par : {request.volunteer.prenom} {request.volunteer.nom}
                    </span>
                </div>
            )}
        </div>
    );
};

export default KanbanCard;
