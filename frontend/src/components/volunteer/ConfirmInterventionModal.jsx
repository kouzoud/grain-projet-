import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, HeartHandshake, FileText, Tag, AlertCircle, User, MapPin, Navigation,
    Calendar, Info, MessageSquare, Shield, Loader2, CheckCircle, Phone
} from 'lucide-react';

const ConfirmInterventionModal = ({ isOpen, onClose, request, onConfirm }) => {
    const [interventionDate, setInterventionDate] = useState('');
    const [interventionTime, setInterventionTime] = useState('');
    const [message, setMessage] = useState('');
    const [confirmAvailability, setConfirmAvailability] = useState(false);
    const [confirmReadInfo, setConfirmReadInfo] = useState(false);
    const [confirmResponsibility, setConfirmResponsibility] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dateError, setDateError] = useState('');

    const firstInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            // Reset form
            setInterventionDate('');
            setInterventionTime('');
            setMessage('');
            setConfirmAvailability(false);
            setConfirmReadInfo(false);
            setConfirmResponsibility(false);
            setIsSubmitting(false);
            setDateError('');

            // Focus first input
            setTimeout(() => firstInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleDateChange = (e) => {
        const date = e.target.value;
        setInterventionDate(date);

        if (new Date(date) < new Date().setHours(0, 0, 0, 0)) {
            setDateError('La date ne peut pas être dans le passé');
        } else {
            setDateError('');
        }
    };

    const setSuggestion = (type) => {
        const now = new Date();
        // Add 5 minutes buffer for "now" to avoid server-side "past date" validation issues
        if (type === 'now') {
            now.setMinutes(now.getMinutes() + 15);
            setInterventionDate(now.toISOString().split('T')[0]);
            setInterventionTime(now.toTimeString().split(' ')[0].substring(0, 5));
        } else if (type === '1h') {
            now.setHours(now.getHours() + 1);
            setInterventionDate(now.toISOString().split('T')[0]);
            setInterventionTime(now.toTimeString().split(' ')[0].substring(0, 5));
        } else if (type === '2h') {
            now.setHours(now.getHours() + 2);
            setInterventionDate(now.toISOString().split('T')[0]);
            setInterventionTime(now.toTimeString().split(' ')[0].substring(0, 5));
        } else if (type === 'today') {
            // If it's already past 14:00, suggest tomorrow 14:00
            if (now.getHours() >= 14) {
                now.setDate(now.getDate() + 1);
            }
            setInterventionDate(now.toISOString().split('T')[0]);
            setInterventionTime('14:00');
        }
        setDateError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (dateError) return;

        setIsSubmitting(true);
        try {
            const fullDate = `${interventionDate}T${interventionTime}:00`;
            await onConfirm({
                dateIntervention: fullDate,
                message: message
            });
            // onConfirm should handle closing or success state
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    const canConfirm =
        interventionDate &&
        interventionTime &&
        confirmAvailability &&
        confirmReadInfo &&
        confirmResponsibility &&
        !dateError;

    if (!request) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1100]"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[1100] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto flex flex-col">

                            {/* Header */}
                            <div className="p-6 text-center border-b border-gray-100 relative">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>

                                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
                                    <HeartHandshake className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Confirmer Votre Intervention
                                </h2>
                                <p className="text-gray-600">
                                    Vous aidez <span className="font-semibold text-orange-600">{request.authorName || "un citoyen"}</span>
                                </p>
                            </div>

                            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">

                                {/* Résumé de la demande */}
                                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText className="w-5 h-5 text-orange-600" />
                                        <h3 className="font-semibold text-gray-900">Résumé de la Demande</h3>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-600">Type :</span>
                                            <span className="font-medium text-orange-600">{request.category}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-green-600" />
                                            <span className="text-gray-600">Tél. Citoyen :</span>
                                            <a href={`tel:${request.author?.telephone}`} className="font-medium text-green-600 hover:underline">
                                                {request.author?.telephone || "Non disponible"}
                                            </a>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-600">Demandeur :</span>
                                            <span className="font-medium">{request.authorName || "Anonyme"}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-600">Localisation :</span>
                                            <span className="font-medium truncate max-w-[200px]">
                                                {request.location ? `${request.location.lat?.toFixed(4)}, ${request.location.lng?.toFixed(4)}` : "Non spécifiée"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Date et Heure */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4 text-orange-500" />
                                        Date et Heure d'Intervention
                                    </label>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <input
                                                ref={firstInputRef}
                                                type="date"
                                                min={new Date().toISOString().split('T')[0]}
                                                value={interventionDate}
                                                onChange={handleDateChange}
                                                className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-colors ${dateError ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'}`}
                                            />
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={interventionTime}
                                                onChange={(e) => setInterventionTime(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {dateError && (
                                        <p className="text-red-500 text-xs mt-1">{dateError}</p>
                                    )}

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <button type="button" onClick={() => setSuggestion('now')} className="px-3 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors">⚡ Maintenant</button>
                                        <button type="button" onClick={() => setSuggestion('1h')} className="px-3 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors">🕐 Dans 1h</button>
                                        <button type="button" onClick={() => setSuggestion('2h')} className="px-3 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors">🕑 Dans 2h</button>
                                        <button type="button" onClick={() => setSuggestion('today')} className="px-3 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors">📅 Aujourd'hui 14h</button>
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <MessageSquare className="w-4 h-4 text-orange-500" />
                                        Message pour le demandeur (Optionnel)
                                    </label>

                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder={`Bonjour, je serai disponible vers ${interventionTime || '...'}...`}
                                        rows={3}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none transition-colors resize-none"
                                        maxLength={500}
                                    />
                                    <div className="flex justify-end mt-1">
                                        <span className="text-xs text-gray-400">{message.length}/500</span>
                                    </div>
                                </div>

                                {/* Engagement */}
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                    <div className="flex items-start gap-2 mb-3">
                                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <h3 className="font-semibold text-gray-900">Votre Engagement</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={confirmAvailability}
                                                onChange={(e) => setConfirmAvailability(e.target.checked)}
                                                className="mt-1 w-4 h-4 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                                                Je confirme être <strong>disponible</strong> à la date et heure indiquées
                                            </span>
                                        </label>

                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={confirmReadInfo}
                                                onChange={(e) => setConfirmReadInfo(e.target.checked)}
                                                className="mt-1 w-4 h-4 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                                                J'ai lu et compris les <strong>informations de la demande</strong>
                                            </span>
                                        </label>

                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={confirmResponsibility}
                                                onChange={(e) => setConfirmResponsibility(e.target.checked)}
                                                className="mt-1 w-4 h-4 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                                                Je m'engage à respecter la <strong>charte du bénévole</strong>
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Info Note */}
                                <div className="bg-gray-50 border-l-4 border-orange-500 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-gray-700">
                                            <p className="font-medium">À savoir :</p>
                                            <p className="text-gray-600 mt-1">Le demandeur sera notifié instantanément. Vous recevrez ses coordonnées après confirmation.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3.5 text-gray-700 bg-white border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                                >
                                    Annuler
                                </button>

                                <button
                                    onClick={handleSubmit}
                                    disabled={!canConfirm || isSubmitting}
                                    className={`
                                        flex-1 px-6 py-3.5 rounded-xl font-semibold
                                        flex items-center justify-center gap-2
                                        transition-all duration-200
                                        ${canConfirm && !isSubmitting
                                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:scale-[1.02] shadow-orange-500/20'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Confirmation...
                                        </>
                                    ) : (
                                        <>
                                            <HeartHandshake className="w-5 h-5" />
                                            Confirmer l'Intervention
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ConfirmInterventionModal;
