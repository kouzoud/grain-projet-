import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Edit3, Trash2, Eye, MoreHorizontal, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getSingleImageUrl, defaultImage } from '../../utils/imageUtils';

const RequestCard = ({ request, onEdit, onDelete, index = 0 }) => {
    const { t, i18n } = useTranslation();
    const [showMenu, setShowMenu] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const isRTL = i18n.language === 'ar';

    const getStatusConfig = (status) => {
        const configs = {
            'VALIDE': {
                label: t('status.VALIDE'),
                bg: 'bg-cyan-50 dark:bg-cyan-500/20',
                text: 'text-cyan-700 dark:text-cyan-300',
                border: 'border-cyan-200 dark:border-cyan-500/30',
                dot: 'bg-cyan-500',
                glow: 'shadow-cyan-500/20'
            },
            'EN_COURS': {
                label: t('status.EN_COURS'),
                bg: 'bg-orange-50 dark:bg-orange-500/20',
                text: 'text-orange-700 dark:text-orange-300',
                border: 'border-orange-200 dark:border-orange-500/30',
                dot: 'bg-orange-500 animate-pulse',
                glow: 'shadow-orange-500/20'
            },
            'RESOLU': {
                label: t('status.RESOLU'),
                bg: 'bg-emerald-50 dark:bg-emerald-500/20',
                text: 'text-emerald-700 dark:text-emerald-300',
                border: 'border-emerald-200 dark:border-emerald-500/30',
                dot: 'bg-emerald-500',
                glow: 'shadow-emerald-500/20'
            },
            'REJETE': {
                label: t('status.REFUSE'),
                bg: 'bg-red-50 dark:bg-red-500/20',
                text: 'text-red-700 dark:text-red-300',
                border: 'border-red-200 dark:border-red-500/30',
                dot: 'bg-red-500',
                glow: 'shadow-red-500/20'
            },
            'EN_ATTENTE': {
                label: t('status.EN_ATTENTE'),
                bg: 'bg-amber-50 dark:bg-amber-500/20',
                text: 'text-amber-700 dark:text-amber-300',
                border: 'border-amber-200 dark:border-amber-500/30',
                dot: 'bg-amber-400 animate-pulse',
                glow: 'shadow-amber-500/20'
            }
        };
        return configs[status] || configs['EN_ATTENTE'];
    };

    const getCategoryConfig = (category) => {
        const configs = {
            'MEDICAL': { bg: 'bg-rose-500', label: t('newRequest.categories.MEDICAL'), icon: '🏥' },
            'ALIMENTAIRE': { bg: 'bg-amber-500', label: t('newRequest.categories.ALIMENTAIRE'), icon: '🍽️' },
            'LOGISTIQUE': { bg: 'bg-indigo-500', label: t('newRequest.categories.LOGISTIQUE'), icon: '📦' },
            'AUTRE': { bg: 'bg-slate-500', label: t('newRequest.categories.AUTRE'), icon: '📋' }
        };
        return configs[category] || configs['AUTRE'];
    };

    const getRelativeTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (isRTL) {
            if (diffMins < 1) return "الآن";
            if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
            if (diffHours < 24) return `منذ ${diffHours} ساعة`;
            if (diffDays === 1) return "أمس";
            if (diffDays < 7) return `منذ ${diffDays} أيام`;
            return date.toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' });
        } else {
            if (diffMins < 1) return "À l'instant";
            if (diffMins < 60) return `Il y a ${diffMins}min`;
            if (diffHours < 24) return `Il y a ${diffHours}h`;
            if (diffDays === 1) return "Hier";
            if (diffDays < 7) return `Il y a ${diffDays}j`;
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
    };

    const getCoverImage = () => {
        if (request.photosUrl && Array.isArray(request.photosUrl) && request.photosUrl.length > 0) {
            return getSingleImageUrl(request.photosUrl[0]);
        }
        return defaultImage;
    };

    const statusConfig = getStatusConfig(request.status);
    const categoryConfig = getCategoryConfig(request.category);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: index * 0.05
            }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="group relative bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-gray-200/60 dark:hover:shadow-slate-900/50 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer backdrop-blur-sm"
            onClick={() => onEdit && onEdit(request)}
        >
            {/* Cover Image */}
            <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-slate-700">
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 animate-pulse" />
                )}
                <img
                    src={getCoverImage()}
                    alt={request.title}
                    className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; setImageLoaded(true); }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`${categoryConfig.bg} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg inline-flex items-center gap-1.5`}
                    >
                        <span>{categoryConfig.icon}</span>
                        {categoryConfig.label}
                    </motion.span>
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} shadow-md ${statusConfig.glow}`}
                    >
                        <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                        {statusConfig.label}
                    </motion.span>
                </div>

                {/* Photo Count */}
                {request.photosUrl && request.photosUrl.length > 1 && (
                    <div className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                        +{request.photosUrl.length - 1} {isRTL ? 'صور' : 'photos'}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {request.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">
                    {request.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-4">
                        {/* Location */}
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-500 dark:text-gray-400">
                                {request.latitude ? (isRTL ? 'موقع محدد' : 'Localisé') : (isRTL ? 'غير محدد' : 'Non localisé')}
                            </span>
                        </div>
                        
                        {/* Time */}
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-500 dark:text-gray-400">{getRelativeTime(request.createdAt)}</span>
                        </div>
                    </div>

                    {/* View indicator */}
                    <div className="flex items-center gap-1 text-cyan-500 dark:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-medium">{isRTL ? 'عرض' : 'Voir'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="px-5 pb-5">
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onEdit && onEdit(request)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-cyan-50 dark:hover:bg-cyan-500/20 text-gray-700 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400 text-sm font-medium transition-all duration-200 border border-transparent hover:border-cyan-200 dark:hover:border-cyan-500/30"
                    >
                        <Edit3 className="w-4 h-4" />
                        {t('dashboard.citizen.requestCard.edit')}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDelete && onDelete(request.id)}
                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-red-50 dark:hover:bg-red-500/20 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 border border-transparent hover:border-red-200 dark:hover:border-red-500/30"
                        title={t('dashboard.citizen.requestCard.delete')}
                    >
                        <Trash2 className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default RequestCard;
