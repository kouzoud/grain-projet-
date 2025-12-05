import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useTranslation } from 'react-i18next';
import { Layers, Map as MapIcon, Activity } from 'lucide-react';
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

const AdminMap = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [requests, setRequests] = useState([]);
    const [mode, setMode] = useState('MARKERS'); // 'MARKERS' or 'HEATMAP'
    const [heatmapPoints, setHeatmapPoints] = useState([]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await casService.getAllCases();
                setRequests(data);

                // Prepare heatmap data: [lat, lng, intensity]
                const points = data
                    .filter(r => r.latitude && r.longitude)
                    .map(r => [r.latitude, r.longitude, 0.8]); // Intensity 0.8 by default
                setHeatmapPoints(points);

            } catch (error) {
                console.error("Failed to fetch requests", error);
            }
        };

        fetchRequests();
    }, []);

    return (
        <div className="h-screen flex flex-col relative bg-slate-900">
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
                                    <Popup className="custom-popup-dark">
                                        <div className="p-2 bg-slate-800 text-white rounded border border-slate-700">
                                            <h3 className="font-bold text-cyan-400">{request.titre}</h3>
                                            <p className="text-sm text-slate-300">{request.categorie}</p>
                                            <div className="mt-2">
                                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${request.statut === 'EN_ATTENTE' ? 'bg-yellow-500/20 text-yellow-500' :
                                                    request.statut === 'EN_COURS' ? 'bg-green-500/20 text-green-500' :
                                                        'bg-slate-700 text-slate-300'
                                                    }`}>
                                                    {request.statut}
                                                </span>
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
