import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MapPin, Calendar, ArrowRight, Eye, Edit, Trash2 } from 'lucide-react';
import RequestModal from './RequestModal';
import SocialShareButton from './common/SocialShareButton';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getSingleImageUrl, defaultImage } from '../utils/imageUtils';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const RequestCard = ({ request, isVolunteer = false, onEdit, onDelete, darkMode = false, ...props }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    // Fonction pour extraire le nom du fichier (gère String ou Array, et photosUrl)
    const getPhotoName = (req) => {
        if (req.photoUrl) return req.photoUrl; // Si c'est une string directe
        if (Array.isArray(req.existingPhotos) && req.existingPhotos.length > 0) return req.existingPhotos[0]; // Si c'est un tableau 'existingPhotos'
        if (Array.isArray(req.photos) && req.photos.length > 0) return req.photos[0]; // Si c'est un tableau 'photos'
        if (Array.isArray(req.photosUrl) && req.photosUrl.length > 0) return req.photosUrl[0]; // Si c'est un tableau 'photosUrl'
        return null;
    };

    const photoName = getPhotoName(request);
    const imageUrl = getSingleImageUrl(photoName);

    // Dynamic classes based on darkMode
    const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-page-card border-gray-100';
    const titleColor = darkMode ? 'text-white' : 'text-primary-dark';
    const textColor = darkMode ? 'text-slate-300' : 'text-secondary';
    const iconColor = darkMode ? 'text-slate-400' : 'text-secondary';

    return (
        <>
            <div className={`${cardBg} rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border group`}>
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={imageUrl || defaultImage}
                        alt={request.titre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultImage;
                        }}
                    />
                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                        <div className="flex items-center gap-2">
                            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary-dark shadow-sm">
                                {request.categorie}
                            </span>
                            {request.status !== 'RESOLU' && request.statut !== 'RESOLU' && (
                                <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                                    <SocialShareButton
                                        title={request.titre}
                                        description={request.description}
                                        caseId={request.id}
                                        ville={request.ville}
                                    />
                                </div>
                            )}
                        </div>
                        {request.status && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${request.status === 'EN_COURS' ? 'bg-green-100 text-green-800' :
                                request.status === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                                    request.status === 'REJETE' ? 'bg-red-100 text-red-800' :
                                        request.status === 'RESOLU' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                }`}>
                                {request.status}
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    <h3 className={`text-xl font-bold mb-2 line-clamp-1 ${titleColor}`}>{request.titre}</h3>
                    <p className={`mb-4 line-clamp-2 text-sm ${textColor}`}>{request.description}</p>

                    <div className={`flex items-center text-sm mb-4 ${iconColor}`}>
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">
                            {request.latitude !== undefined ? request.latitude.toFixed(4) : 'N/A'}, {request.longitude !== undefined ? request.longitude.toFixed(4) : 'N/A'}
                        </span>
                    </div>

                    <div className={`flex justify-between items-center pt-4 border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsMapModalOpen(true)}
                                className="text-primary hover:text-primary-dark text-sm font-medium flex items-center transition-colors"
                                title="Voir sur la carte"
                            >
                                <Eye className="w-4 h-4" />
                            </button>

                            {(onEdit || onDelete) && (
                                <>
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(request)}
                                            className="text-blue-500 hover:text-blue-700 transition-colors"
                                            title="Modifier"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(request.id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </>
                            )}
                            {/* Custom Actions Injection */}
                            {props.customActions}
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                        >
                            {isVolunteer ? "Proposer mon aide" : "Détails"}
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                </div>
            </div>

            <RequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                request={request}
                isVolunteer={isVolunteer}
                onTakeAction={() => console.log("Prise en charge action")}
            />

            {/* Map Modal */}
            {isMapModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-3xl h-[500px] relative overflow-hidden shadow-2xl">
                        <button
                            onClick={() => setIsMapModalOpen(false)}
                            className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-full shadow-lg hover:bg-gray-100"
                        >
                            ✕
                        </button>
                        <MapContainer
                            center={[request.latitude || 0, request.longitude || 0]}
                            zoom={15}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={[request.latitude || 0, request.longitude || 0]}>
                                <Popup>
                                    {request.titre}
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </div>
            )}
        </>
    );
};

RequestCard.propTypes = {
    request: PropTypes.shape({
        id: PropTypes.number.isRequired,
        titre: PropTypes.string.isRequired,
        description: PropTypes.string,
        categorie: PropTypes.string,
        statut: PropTypes.string,
        latitude: PropTypes.number,
        longitude: PropTypes.number,
        createdAt: PropTypes.string,
        photos: PropTypes.array,
        existingPhotos: PropTypes.array,
        photoUrl: PropTypes.string
    }).isRequired,
    isVolunteer: PropTypes.bool,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    darkMode: PropTypes.bool
};

RequestCard.defaultProps = {
    isVolunteer: false,
    onEdit: null,
    onDelete: null,
    darkMode: false
};

export default RequestCard;
