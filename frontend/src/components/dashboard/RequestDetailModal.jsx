import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Calendar, User, Package, AlertCircle, ExternalLink, Edit3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getSingleImageUrl, defaultImage } from '../../utils/imageUtils';

const RequestDetailModal = ({ request, isOpen, onClose, onEdit }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    if (!request) return null;

    const getStatusConfig = (status) => {
        const configs = {
            'VALIDE': {
                label: t('status.VALIDE'),
                bg: 'bg-cyan-50 dark:bg-cyan-500/20',
                text: 'text-cyan-700 dark:text-cyan-300',
                border: 'border-cyan-200 dark:border-cyan-500/30',
                dot: 'bg-cyan-500'
            },
            'EN_COURS': {
                label: t('status.EN_COURS'),
                bg: 'bg-orange-50 dark:bg-orange-500/20',
                text: 'text-orange-700 dark:text-orange-300',
                border: 'border-orange-200 dark:border-orange-500/30',
                dot: 'bg-orange-500 animate-pulse'
            },
            'RESOLU': {
                label: t('status.RESOLU'),
                bg: 'bg-emerald-50 dark:bg-emerald-500/20',
                text: 'text-emerald-700 dark:text-emerald-300',
                border: 'border-emerald-200 dark:border-emerald-500/30',
                dot: 'bg-emerald-500'
            },
            'REJETE': {
                label: t('status.REFUSE'),
                bg: 'bg-red-50 dark:bg-red-500/20',
                text: 'text-red-700 dark:text-red-300',
                border: 'border-red-200 dark:border-red-500/30',
                dot: 'bg-red-500'
            },
            'EN_ATTENTE': {
                label: t('status.EN_ATTENTE'),
                bg: 'bg-amber-50 dark:bg-amber-500/20',
                text: 'text-amber-700 dark:text-amber-300',
                border: 'border-amber-200 dark:border-amber-500/30',
                dot: 'bg-amber-400 animate-pulse'
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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return isRTL 
            ? date.toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const statusConfig = getStatusConfig(request.status);
    const categoryConfig = getCategoryConfig(request.category);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header avec image */}
                            <div className="relative h-64 overflow-hidden bg-gradient-to-br from-cyan-500 to-purple-600">
                                {request.photosUrl && request.photosUrl.length > 0 && (
                                    <img
                                        src={getSingleImageUrl(request.photosUrl[0])}
                                        alt={request.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                
                                {/* Badges */}
                                <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 flex gap-2">
                                    <span className={`${categoryConfig.bg} text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg inline-flex items-center gap-2`}>
                                        <span>{categoryConfig.icon}</span>
                                        {categoryConfig.label}
                                    </span>
                                </div>

                                <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
                                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} shadow-lg`}>
                                        <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                                        {statusConfig.label}
                                    </span>
                                </div>

                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8 overflow-y-auto max-h-[calc(90vh-16rem)]">
                                {/* Title */}
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                    {request.title}
                                </h2>

                                {/* Meta Info */}
                                <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(request.createdAt)}</span>
                                    </div>
                                    {request.latitude && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{isRTL ? 'موقع محدد' : 'Position localisée'}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-cyan-500" />
                                        {isRTL ? 'الوصف' : 'Description'}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {request.description}
                                    </p>
                                </div>

                                {/* Photos */}
                                {request.photosUrl && request.photosUrl.length > 1 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                            {isRTL ? 'الصور' : 'Photos'}
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {request.photosUrl.map((photo, index) => (
                                                <img
                                                    key={index}
                                                    src={getSingleImageUrl(photo)}
                                                    alt={`${request.title} - ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                                                    onError={(e) => { e.target.src = defaultImage; }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-slate-700">
                                    <button
                                        onClick={() => {
                                            onEdit(request);
                                            onClose();
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
                                    >
                                        <Edit3 className="w-5 h-5" />
                                        {t('dashboard.citizen.requestCard.edit')}
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all"
                                    >
                                        {isRTL ? 'إغلاق' : 'Fermer'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default RequestDetailModal;
