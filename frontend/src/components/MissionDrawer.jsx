import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, User, Clock, AlertCircle, HeartPulse } from 'lucide-react';
import { getSingleImageUrl, defaultImage } from '../utils/imageUtils';

const MissionDrawer = ({ isOpen, onClose, mission, onTakeAction }) => {
    if (!mission) return null;

    const categoryColors = {
        'ALIMENTAIRE': 'bg-orange-100 text-orange-800 border-orange-200',
        'MEDICAL': 'bg-red-100 text-red-800 border-red-200',
        'LOGISTIQUE': 'bg-blue-100 text-blue-800 border-blue-200',
        'SOCIAL': 'bg-purple-100 text-purple-800 border-purple-200',
        'AUTRE': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-[1001]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-[1002] overflow-y-auto flex flex-col"
                    >
                        {/* Header Image */}
                        <div className="relative h-64 shrink-0">
                            <img
                                src={getSingleImageUrl(mission.photosUrl?.[0]) || defaultImage}
                                alt={mission.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="absolute bottom-4 left-4 right-4">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 border ${categoryColors[mission.category] || categoryColors['AUTRE']}`}>
                                    {mission.category}
                                </span>
                                <h2 className="text-2xl font-bold text-white leading-tight">{mission.title}</h2>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 space-y-6">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-primary">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Distance</p>
                                        <p className="font-semibold text-gray-800">
                                            {mission.distance ? `${mission.distance.toFixed(1)} km` : 'À proximité'}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-primary">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Publié</p>
                                        <p className="font-semibold text-gray-800">
                                            {new Date(mission.createdAt || Date.now()).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">À propos de la mission</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {mission.description}
                                </p>
                            </div>

                            {/* Author Info (Mocked for now if not available) */}
                            <div className="border-t border-gray-100 pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-xl">
                                        {mission.authorName ? mission.authorName.charAt(0) : <User />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Demandé par {mission.authorName || 'Un citoyen'}</p>
                                        <p className="text-sm text-gray-500">Membre vérifié</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                            <button
                                onClick={() => onTakeAction(mission)}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                <HeartPulse size={20} />
                                Je propose mon aide
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-1">
                                <AlertCircle size={12} />
                                Votre engagement est précieux, merci de votre sérieux.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

MissionDrawer.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    mission: PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
        description: PropTypes.string,
        categorie: PropTypes.string,
        latitude: PropTypes.number,
        longitude: PropTypes.number,
        createdAt: PropTypes.string,
        photosUrl: PropTypes.array
    }),
    onTakeAction: PropTypes.func
};

export default MissionDrawer;
