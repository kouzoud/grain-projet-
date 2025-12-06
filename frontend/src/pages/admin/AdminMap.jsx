import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useTranslation } from 'react-i18next';
import { Layers, Map as MapIcon, Activity, User, Calendar, MapPin, Phone, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import HeatmapLayer from '../../components/admin/HeatmapLayer';
import casService from '../../services/casService';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix des icônes par défaut de Leaflet dans React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Cluster Icon (Dark Mode)
const createClusterCustomIcon = function (cluster) {
    return L.divIcon({
        html: `<span class="text-white font-bold">${cluster.getChildCount()}</span>`,
        className: 'marker-cluster-custom bg-slate-800 border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]',
        iconSize: L.point(40, 40, true),
    });
};

// Pulsing Marker Icon Creator
const createPulsingIcon = (category) => {
    let color = '#94a3b8'; // Default gray
    if (category === 'ALIMENTAIRE') color = '#f97316'; // Orange
    if (category === 'MEDICAL') color = '#ef4444'; // Red
    if (category === 'LOGEMENT') color = '#3b82f6'; // Blue
    if (category === 'LOGISTIQUE') color = '#eab308'; // Yellow

    return L.divIcon({
        className: 'marker-pulse',
        html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 10px ${color};"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5]
    });
};

// Component to handle viewport-based loading
const ViewportLoader = ({ onViewportChange }) => {
    const map = useMapEvents({
        moveend: () => {
            const bounds = map.getBounds();
            onViewportChange(bounds);
        },
        zoomend: () => {
            const bounds = map.getBounds();
            onViewportChange(bounds);
        }
    });

    useEffect(() => {
        const bounds = map.getBounds();
        onViewportChange(bounds);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return null;
};

const AdminMap = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [requests, setRequests] = useState([]);
    const [mode, setMode] = useState('MARKERS'); // 'MARKERS' or 'HEATMAP'
    const [heatmapPoints, setHeatmapPoints] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const debounceTimerRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Fetch cases within viewport with debounce
    const fetchCasesInViewport = useCallback(async (bounds) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(async () => {
            try {
                setLoading(true);
                abortControllerRef.current = new AbortController();

                const params = {
                    minLon: bounds.getWest(),
                    minLat: bounds.getSouth(),
                    maxLon: bounds.getEast(),
                    maxLat: bounds.getNorth(),
                    page: 0,
                    size: 200 // Admin peut charger plus
                };

                const response = await casService.getCasesInViewport(params);
                const data = response.content || response.data?.content || response;

                setRequests(data);

                // Préparer données heatmap (échantillonnage si >1000)
                const points = data
                    .filter(r => r.latitude && r.longitude)
                    .map(r => [r.latitude, r.longitude, 0.8]);
                
                // Si trop de points, échantillonner pour performance
                const sampledPoints = points.length > 1000 
                    ? points.filter((_, index) => index % Math.ceil(points.length / 1000) === 0)
                    : points;
                
                setHeatmapPoints(sampledPoints);

            } catch (error) {
                if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
                    console.error("Failed to fetch cases in viewport", error);
                }
            } finally {
                setLoading(false);
                abortControllerRef.current = null;
            }
        }, 500);
    }, []);

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col relative bg-slate-900">
            {/* Control Panel (Glassmorphism) */}
            <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} z-[1000] bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl w-64`}>
                <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                    <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <h2 className="text-white font-bold text-lg tracking-wider uppercase">{isRTL ? 'مراقبة مباشرة' : 'Live Monitor'}</h2>
                </div>

                {/* Toggle Switch */}
                <div className="flex bg-slate-800 rounded-lg p-1 mb-4 border border-slate-700">
                    <button
                        onClick={() => setMode('MARKERS')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${mode === 'MARKERS'
                            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <MapIcon className="w-3 h-3" />
                        {isRTL ? 'علامات' : 'MARKERS'}
                    </button>
                    <button
                        onClick={() => setMode('HEATMAP')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${mode === 'HEATMAP'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Layers className="w-3 h-3" />
                        {isRTL ? 'خريطة حرارية' : 'HEATMAP'}
                    </button>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-2">{isRTL ? 'المفتاح' : 'Légende'}</p>
                    {mode === 'MARKERS' ? (
                        <>
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span> {t('newRequest.categories.ALIMENTAIRE')}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span> {t('newRequest.categories.MEDICAL')}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span> {isRTL ? 'سكن' : 'Logement'}
                            </div>
                        </>
                    ) : (
                        <div className="h-2 w-full rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-red-500 opacity-80"></div>
                    )}
                </div>
            </div>

            <MapContainer center={[31.7917, -7.0926]} zoom={6} style={{ height: '100%', width: '100%', background: '#0f172a' }}>
                <ViewportLoader onViewportChange={fetchCasesInViewport} />
                
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="🗺️ Plan Standard">
                        <TileLayer
                            attribution='Tiles &copy; Esri'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="🛰️ Satellite">
                        <TileLayer
                            attribution='Tiles &copy; Esri'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="🌙 Mode Sombre">
                        <TileLayer
                            attribution='&copy; CartoDB'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="👁️ Haute Lisibilité">
                        <TileLayer
                            attribution='&copy; OpenStreetMap France'
                            url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {mode === 'MARKERS' && (
                    <MarkerClusterGroup
                        chunkedLoading
                        iconCreateFunction={createClusterCustomIcon}
                    >
                        {requests.map(request => {
                            if (!request.latitude || !request.longitude) return null;
                            return (
                                <Marker
                                    key={request.id}
                                    position={[request.latitude, request.longitude]}
                                    icon={createPulsingIcon(request.categorie)}
                                >
                                    <Popup className="custom-popup-dark" maxWidth={400} minWidth={320}>
                                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-lg shadow-2xl overflow-hidden border border-slate-700">
                                            {/* Header avec statut */}
                                            <div className="relative bg-slate-950/50 px-4 py-3 border-b border-slate-700">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-base text-cyan-400 mb-1 truncate">{request.titre}</h3>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
                                                                request.categorie === 'ALIMENTAIRE' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                                                request.categorie === 'MEDICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                                request.categorie === 'LOGISTIQUE' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                            }`}>
                                                                {request.categorie}
                                                            </span>
                                                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
                                                                request.statut === 'EN_ATTENTE' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                                request.statut === 'VALIDE' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                                                                request.statut === 'EN_COURS' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                                                request.statut === 'RESOLU' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                                'bg-red-500/20 text-red-400 border border-red-500/30'
                                                            }`}>
                                                                {request.statut === 'EN_ATTENTE' ? <Clock className="w-3 h-3" /> :
                                                                 request.statut === 'EN_COURS' ? <AlertCircle className="w-3 h-3" /> :
                                                                 request.statut === 'RESOLU' ? <CheckCircle className="w-3 h-3" /> :
                                                                 request.statut === 'VALIDE' ? <CheckCircle className="w-3 h-3" /> :
                                                                 <XCircle className="w-3 h-3" />}
                                                                {request.statut}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Corps avec informations détaillées */}
                                            <div className="px-4 py-3 space-y-2">
                                                {/* Description */}
                                                {request.description && (
                                                    <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                                                        {request.description}
                                                    </p>
                                                )}

                                                {/* Informations du citoyen */}
                                                {request.utilisateur && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 rounded-lg px-3 py-2">
                                                        <User className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                                                        <span className="font-medium text-slate-200">
                                                            {request.utilisateur.prenom} {request.utilisateur.nom}
                                                        </span>
                                                        {request.utilisateur.telephone && (
                                                            <>
                                                                <span className="text-slate-600">•</span>
                                                                <Phone className="w-3.5 h-3.5 text-slate-500" />
                                                                <span className="text-slate-400">{request.utilisateur.telephone}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Date et localisation */}
                                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                                        <span>{new Date(request.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                    <span className="text-slate-600">•</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                                        <span>{request.latitude?.toFixed(4)}, {request.longitude?.toFixed(4)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MarkerClusterGroup>
                )}

                {mode === 'HEATMAP' && (
                    <HeatmapLayer points={heatmapPoints} />
                )}
            </MapContainer>
        </div>
    );
};

export default AdminMap;
