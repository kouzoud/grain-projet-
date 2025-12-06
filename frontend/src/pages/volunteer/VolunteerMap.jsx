import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, LayersControl, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Filter, Search, Crosshair, List } from 'lucide-react';
import ConfirmInterventionModal from '../../components/volunteer/ConfirmInterventionModal';
import MissionDrawer from '../../components/MissionDrawer';
import casService from '../../services/casService';
import { createCustomIcon } from '../../components/CustomMarker';
import useInterventionConfirmation from '../../hooks/useInterventionConfirmation';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


// Custom Cluster Icon
const createClusterCustomIcon = function (cluster) {
    return L.divIcon({
        html: `<span class="flex items-center justify-center w-full h-full text-white font-bold">${cluster.getChildCount()}</span>`,
        className: 'marker-cluster-custom bg-primary border-4 border-white shadow-lg rounded-full',
        iconSize: L.point(40, 40, true),
    });
};

// Component to handle map center updates
const MapUpdater = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom || map.getZoom());
        }
    }, [center, zoom, map]);
    return null;
};

// Component to handle viewport-based loading with debounce
const ViewportLoader = ({ onViewportChange, debounceMs = 500 }) => {
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

    // Initial load
    useEffect(() => {
        const bounds = map.getBounds();
        onViewportChange(bounds);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return null;
};

const VolunteerMap = () => {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [interventionRequest, setInterventionRequest] = useState(null);
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [mapCenter, setMapCenter] = useState([31.7917, -7.0926]); // Default Morocco center
    const [mapZoom, setMapZoom] = useState(6); // Default zoom level
    const [loading, setLoading] = useState(false);
    
    const debounceTimerRef = useRef(null);
    const abortControllerRef = useRef(null);

    const { confirmIntervention } = useInterventionConfirmation(() => {
        setInterventionRequest(null);
        setRequests(prev => prev.filter(r => r.id !== interventionRequest.id));
        alert(`Merci ! Vous avez pris en charge la demande : ${interventionRequest?.title}`);
    });

    // Fetch cases within viewport with debounce
    const fetchCasesInViewport = useCallback(async (bounds) => {
        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Clear previous debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Debounce 500ms
        debounceTimerRef.current = setTimeout(async () => {
            try {
                setLoading(true);
                abortControllerRef.current = new AbortController();

                const params = {
                    minLon: bounds.getWest(),
                    minLat: bounds.getSouth(),
                    maxLon: bounds.getEast(),
                    maxLat: bounds.getNorth(),
                    status: 'VALIDE',
                    page: 0,
                    size: 100
                };

                const response = await casService.getCasesInViewport(params);
                const data = response.content || response.data?.content || response;

                const mappedRequests = data.map(cas => ({
                    id: cas.id,
                    title: cas.titre || "",
                    description: cas.description || "",
                    category: cas.categorie,
                    status: cas.statut,
                    latitude: cas.latitude,
                    longitude: cas.longitude,
                    createdAt: cas.createdAt,
                    authorName: cas.author?.nom ? `${cas.author.prenom} ${cas.author.nom}` : null,
                    author: cas.author,
                    location: {
                        lat: cas.latitude || 0,
                        lng: cas.longitude || 0
                    },
                    photosUrl: cas.photos
                }));

                setRequests(mappedRequests);
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

    // Cleanup on unmount
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

    const filteredRequests = requests.filter(r => {
        const matchesCategory = filterCategory === 'ALL' || r.category === filterCategory;
        const title = r.title || "";
        const description = r.description || "";
        const query = searchQuery || ""; // Safety check

        const matchesSearch = title.toLowerCase().includes(query.toLowerCase()) ||
            description.toLowerCase().includes(query.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    const handleOpenIntervention = (request) => {
        setInterventionRequest(request);
        setSelectedRequest(null);
    };

    const handleConfirmIntervention = async (interventionData) => {
        if (!interventionRequest) return;
        await confirmIntervention(interventionRequest.id, interventionData);
    };

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert("La géolocalisation n'est pas supportée par votre navigateur.");
            return;
        }

        // Options de haute précision
        const options = {
            enableHighAccuracy: true, // CRUCIAL : Force le GPS ou le Wi-Fi précis
            timeout: 10000,           // Attend jusqu'à 10s pour avoir un bon signal
            maximumAge: 0             // Interdit d'utiliser une position mise en cache (vieille)
        };

        const success = (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log(`✅ Position bénévole trouvée avec précision de ${accuracy} mètres`);
            setMapCenter([latitude, longitude]);
            setMapZoom(16); // Zoom 16 = niveau rue pour voir les demandes autour
        };

        const error = (err) => {
            console.warn(`❌ ERREUR GÉOLOCALISATION (Code ${err.code}): ${err.message}`);
            let msg = "Impossible d'obtenir votre position précise.";
            if (err.code === 1) msg = "Vous devez autoriser la géolocalisation dans les paramètres de votre navigateur.";
            if (err.code === 2) msg = "Position indisponible (GPS introuvable). Vérifiez que votre GPS est activé.";
            if (err.code === 3) msg = "Délai d'attente dépassé. Le signal GPS est trop faible.";
            alert(msg);
        };

        navigator.geolocation.getCurrentPosition(success, error, options);
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
            <div className="relative flex-1 w-full">
                {/* Top Bar - Floating Search & Filters */}
                <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col sm:flex-row gap-3 pointer-events-none">
                    {/* Search Box */}
                    <div className="bg-white rounded-xl shadow-lg p-2 flex items-center gap-2 pointer-events-auto flex-1 max-w-md">
                        <Search className="text-gray-400 w-5 h-5 ml-2" />
                        <input
                            type="text"
                            placeholder="Rechercher une mission..."
                            className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none text-gray-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filters Scrollable Area */}
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 pointer-events-auto no-scrollbar">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-white border-none rounded-xl shadow-lg px-4 py-2 text-sm font-medium text-gray-700 cursor-pointer outline-none hover:bg-gray-50 transition-colors"
                        >
                            <option value="ALL">Toutes catégories</option>
                            <option value="ALIMENTAIRE">Alimentaire</option>
                            <option value="MEDICAL">Médical</option>
                            <option value="LOGISTIQUE">Logistique</option>
                            <option value="SOCIAL">Social</option>
                            <option value="AUTRE">Autre</option>
                        </select>

                        <button
                            onClick={handleLocateMe}
                            className="bg-white p-2 rounded-xl shadow-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            title="Me localiser"
                        >
                            <Crosshair size={20} />
                        </button>
                    </div>
                </div>

                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    <MapUpdater center={mapCenter} zoom={mapZoom} />
                    <ViewportLoader onViewportChange={fetchCasesInViewport} />
                    
                    <LayersControl position="bottomright">
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
                    </LayersControl>

                    <MarkerClusterGroup
                        chunkedLoading
                        iconCreateFunction={createClusterCustomIcon}
                    >
                        {filteredRequests.map(request => {
                            const lat = request.location?.lat || request.latitude;
                            const lng = request.location?.lng || request.longitude;

                            if (!lat || !lng) return null;

                            return (
                                <Marker
                                    key={request.id}
                                    position={[lat, lng]}
                                    icon={createCustomIcon(request.category)}
                                    eventHandlers={{
                                        click: () => setSelectedRequest(request),
                                    }}
                                />
                            );
                        })}
                    </MarkerClusterGroup>
                </MapContainer>

                {/* Mission Drawer */}
                <MissionDrawer
                    isOpen={!!selectedRequest}
                    mission={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onTakeAction={handleOpenIntervention}
                />

                {/* Intervention Modal */}
                <ConfirmInterventionModal
                    isOpen={!!interventionRequest}
                    request={interventionRequest}
                    onClose={() => setInterventionRequest(null)}
                    onConfirm={handleConfirmIntervention}
                />
            </div>
        </div>
    );
};

export default VolunteerMap;
