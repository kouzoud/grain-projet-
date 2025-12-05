import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Calendar, Tag, User, ShieldCheck, AlertCircle, Hand, Clock, Phone } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Button from './ui/Button';
import { defaultImage, getSingleImageUrl } from '../utils/imageUtils';

// Fix Leaflet marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

const RequestModal = ({ request, isOpen, onClose, onTakeAction, isVolunteer }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !request) return null;

    // Helper to get all photos
    const getPhotos = () => {
        if (request.existingPhotos && request.existingPhotos.length > 0) return request.existingPhotos;
        if (request.photosUrl && Array.isArray(request.photosUrl) && request.photosUrl.length > 0) return request.photosUrl;
        if (request.photos && Array.isArray(request.photos) && request.photos.length > 0) return request.photos;
        if (request.photoUrl) return [request.photoUrl];
        return [];
    };

    const photos = getPhotos();
    const coverImage = photos.length > 0 ? getSingleImageUrl(photos[0]) : null;

    // Helper for relative time
    const getRelativeTime = (dateString) => {
        if (!dateString) return "Date inconnue";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Date inconnue";

        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return "Hier";
        return `Il y a ${diffDays} jours`;
    };

    // Urgency Calculation
    const getUrgencyLevel = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));

        if (diffDays > 7) return { level: 100, color: 'bg-red-500', text: 'Urgence Élevée', textColor: 'text-red-600' };
        if (diffDays > 3) return { level: 60, color: 'bg-yellow-500', text: 'Urgence Moyenne', textColor: 'text-yellow-600' };
        return { level: 20, color: 'bg-green-500', text: 'Nouveau', textColor: 'text-green-600' };
    };

    const urgency = getUrgencyLevel(request.createdAt);

    const getCategoryColor = (category) => {
        switch (category) {
            case 'MEDICAL': return 'bg-red-100 text-red-600 border-red-200';
            case 'ALIMENTAIRE': return 'bg-orange-100 text-orange-600 border-orange-200';
            case 'LOGEMENT': return 'bg-blue-100 text-blue-600 border-blue-200';
            case 'VETEMENT': return 'bg-purple-100 text-purple-600 border-purple-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">

                {/* 1. Header Cover (Full Width) */}
                <div className="relative h-64 flex-shrink-0 bg-gray-100 group">
                    {coverImage ? (
                        <img
                            src={coverImage}
                            alt="Cover"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                            <Tag className="w-20 h-20 text-white/20" />
                        </div>
                    )}

                    {/* Floating Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white hover:bg-gray-50 text-gray-800 p-2.5 rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="px-4 py-1.5 rounded-full text-xs font-bold shadow-lg uppercase tracking-wider bg-white/95 text-gray-900 backdrop-blur-sm border border-gray-200 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${request.statut === 'VALIDE' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                            {request.status || request.statut}
                        </span>
                    </div>
                </div>

                {/* 2. Main Content (Split Layout) */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 sm:p-8">

                            {/* LEFT COLUMN: The Story (2/3) */}
                            <div className="lg:col-span-2 space-y-8">

                                {/* Header Info */}
                                <div>
                                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                        {request.title || request.titre}
                                    </h2>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium text-gray-700">{request.distance ? `${request.distance} km` : 'À proximité'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium text-gray-700">{getRelativeTime(request.createdAt)}</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${getCategoryColor(request.category || request.categorie)}`}>
                                            <Tag className="w-3.5 h-3.5" />
                                            <span className="font-bold text-xs uppercase tracking-wide">{request.category || request.categorie}</span>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Description */}
                                <div className="prose prose-lg prose-slate max-w-none">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        À propos de ce besoin
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                        {request.description}
                                    </p>
                                </div>

                                {/* Photos Grid */}
                                {photos.length > 1 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                                            <div className="w-8 h-[1px] bg-gray-300"></div>
                                            Photos ({photos.length})
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {photos.slice(1).map((photo, index) => (
                                                <img
                                                    key={index}
                                                    src={getSingleImageUrl(photo)}
                                                    alt={`Gallery ${index}`}
                                                    className="h-32 w-full object-cover rounded-xl cursor-pointer hover:opacity-90 transition-all hover:scale-[1.02] shadow-sm"
                                                    onClick={() => window.open(getSingleImageUrl(photo), '_blank')}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Author Profile Card */}
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-center gap-5">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100">
                                        <User className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            {request.authorName || request.citoyenNom || 'Citoyen'}
                                            <ShieldCheck className="w-5 h-5 text-green-500" />
                                        </h4>
                                        <p className="text-sm text-gray-500 mb-1">Identité vérifiée • Membre depuis 2024</p>
                                        <p className="text-xs text-gray-400">Ce membre a validé son numéro de téléphone et son email.</p>

                                        {/* Phone Number Display */}
                                        {request.author?.telephone && (
                                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-green-800">
                                                    <Phone size={20} />
                                                    <span className="font-bold">{request.author.telephone}</span>
                                                </div>
                                                <a
                                                    href={`tel:${request.author.telephone}`}
                                                    className="text-xs bg-white border border-green-300 text-green-700 px-3 py-1 rounded-full hover:bg-green-100 font-medium transition-colors"
                                                >
                                                    Appeler
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Sticky Action Sidebar (1/3) */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-6 space-y-6">

                                    {/* Action Card */}
                                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

                                        {/* Mini Map */}
                                        <div className="h-40 w-full relative bg-gray-100">
                                            {(request.latitude || request.location) ? (
                                                <MapContainer
                                                    center={[request.latitude || request.location.y, request.longitude || request.location.x]}
                                                    zoom={13}
                                                    style={{ height: '100%', width: '100%' }}
                                                    zoomControl={false}
                                                    dragging={false}
                                                    scrollWheelZoom={false}
                                                    doubleClickZoom={false}
                                                >
                                                    <TileLayer
                                                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                                    />
                                                    <Marker position={[request.latitude || request.location.y, request.longitude || request.location.x]} />
                                                </MapContainer>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                                    <MapPin className="w-5 h-5 mr-2" />
                                                    Localisation masquée
                                                </div>
                                            )}
                                            <div className="absolute inset-0 pointer-events-none border-b border-gray-200"></div>
                                        </div>

                                        <div className="p-6 space-y-6">
                                            {/* Urgency Bar */}
                                            <div>
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Niveau d'urgence</span>
                                                    <span className={`text-xs font-bold ${urgency.textColor}`}>{urgency.text}</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${urgency.color} transition-all duration-1000 ease-out`}
                                                        style={{ width: `${urgency.level}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            {isVolunteer ? (
                                                <Button
                                                    onClick={() => onTakeAction && onTakeAction(request)}
                                                    className="w-full py-4 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                                >
                                                    <Hand className="w-5 h-5" />
                                                    Je prends en charge
                                                </Button>
                                            ) : (
                                                <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                                                    <p className="text-sm text-gray-600 font-medium">Connectez-vous en tant que bénévole pour aider.</p>
                                                </div>
                                            )}

                                            {/* Security Note */}
                                            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                                <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                <p className="text-xs text-blue-700 leading-relaxed">
                                                    <strong>Confiance & Sécurité</strong><br />
                                                    Vos échanges sont sécurisés. Ne partagez jamais d'informations bancaires.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default RequestModal;
