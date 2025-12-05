import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { getSingleImageUrl, defaultImage } from '../../utils/imageUtils';

const RequestCard = ({ request, onEdit, onDelete }) => {

    const getStatusStyle = (status) => {
        switch (status) {
            case 'VALIDE': return 'bg-green-100 text-green-700 border-green-200';
            case 'EN_COURS': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'RESOLU': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'REJETE': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'MEDICAL': return 'bg-rose-500';
            case 'ALIMENTAIRE': return 'bg-amber-500';
            case 'LOGISTIQUE': return 'bg-indigo-500';
            default: return 'bg-slate-500';
        }
    };

    const getRelativeTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return "Hier";
        return `Il y a ${diffDays}j`;
    };

    // Helper to get the first photo URL
    const getCoverImage = () => {
        if (request.photosUrl && request.photosUrl.length > 0) {
            return getSingleImageUrl(request.photosUrl[0]);
        }
        return defaultImage;
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
        >
            {/* Cover Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={getCoverImage()}
                    alt={request.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                    <span className={`${getCategoryColor(request.category)} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm`}>
                        {request.category}
                    </span>
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm backdrop-blur-md ${getStatusStyle(request.status)}`}>
                        {request.status === 'EN_ATTENTE' ? 'En attente' : request.status}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                        {request.title}
                    </h3>
                </div>

                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                    {request.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-5 border-t border-gray-50 pt-4">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[100px]">
                            {request.latitude ? 'Localisé' : 'Non localisé'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{getRelativeTime(request.createdAt)}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                    <button
                        onClick={() => onEdit(request)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors group/btn"
                    >
                        <Edit className="w-4 h-4 text-gray-500 group-hover/btn:text-primary" />
                        Modifier
                    </button>
                    <button
                        onClick={() => onDelete(request.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        title="Supprimer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default RequestCard;
