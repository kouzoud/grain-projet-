import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, X, Plus, Minus, LocateFixed, MapPin } from 'lucide-react';

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



// Custom Map Controls (Zoom & Locate)
const MapControls = ({ onLocationFound }) => {
    const map = useMap();
    const controlsRef = useRef(null);

    useEffect(() => {
        if (controlsRef.current) {
            L.DomEvent.disableClickPropagation(controlsRef.current);
        }
    }, []);

    const handleLocate = (e) => {
        // 1. Empêcher le clic de traverser vers la carte
        e.stopPropagation();
        e.preventDefault();

        if (!navigator.geolocation) {
            alert("La géolocalisation n'est pas supportée par votre navigateur.");
            return;
        }

        // 2. Options de haute précision
        const options = {
            enableHighAccuracy: true, // CRUCIAL : Force le GPS ou le Wi-Fi précis
            timeout: 10000,           // Attend jusqu'à 10s pour avoir un bon signal
            maximumAge: 0             // Interdit d'utiliser une position mise en cache (vieille)
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                console.log(`✅ Position trouvée avec précision de ${accuracy} mètres`);
                const latlng = { lat: latitude, lng: longitude };

                // 3. Action : Bouger la carte et le marqueur (Zoom serré pour voir la rue)
                map.flyTo([latitude, longitude], 18); // Zoom 18 = niveau rue très précis

                // Notifier le parent pour mettre à jour le state et l'adresse
                onLocationFound(latlng);
            },
            (error) => {
                console.warn(`❌ ERREUR GÉOLOCALISATION (Code ${error.code}): ${error.message}`);
                let msg = "Erreur de localisation.";
                if (error.code === 1) msg = "Vous devez autoriser la géolocalisation dans les paramètres de votre navigateur.";
                if (error.code === 2) msg = "Position indisponible (GPS introuvable). Vérifiez que votre GPS est activé.";
                if (error.code === 3) msg = "Délai d'attente dépassé. Le signal GPS est trop faible.";
                alert(msg);
            },
            options
        );
    };

    return (
        <div
            ref={controlsRef}
            className="absolute bottom-6 right-4 flex flex-col gap-3 z-[1000]"
        >
            <div className="flex flex-col bg-white rounded-full shadow-xl border border-gray-100 overflow-hidden">
                <button
                    onClick={(e) => { e.stopPropagation(); map.zoomIn(); }}
                    className="p-3 hover:bg-gray-50 text-gray-700 transition-colors border-b border-gray-100"
                    title="Zoom avant"
                    type="button"
                >
                    <Plus className="w-5 h-5" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); map.zoomOut(); }}
                    className="p-3 hover:bg-gray-50 text-gray-700 transition-colors"
                    title="Zoom arrière"
                    type="button"
                >
                    <Minus className="w-5 h-5" />
                </button>
            </div>

            <button
                onClick={handleLocate}
                className="bg-white p-3 rounded-full shadow-xl border border-gray-100 text-primary hover:bg-gray-50 transition-colors"
                title="Me localiser"
                type="button"
            >
                <LocateFixed className="w-5 h-5" />
            </button>
        </div>
    );
};

// Floating Search Bar
const FloatingSearchBar = ({ onLocationFound }) => {
    const map = useMap();
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        if (searchRef.current) {
            L.DomEvent.disableClickPropagation(searchRef.current);
            L.DomEvent.disableScrollPropagation(searchRef.current);
        }
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=fr&limit=1`
            );
            const results = await response.json();

            if (results && results.length > 0) {
                const first = results[0];
                const latlng = { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
                map.flyTo(latlng, 16);
                onLocationFound(latlng);
            } else {
                alert("Aucun résultat trouvé");
            }
        } catch (err) {
            console.error("Search error:", err);
            alert("Erreur lors de la recherche");
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent parent form submission
            handleSearch(e);
        }
    };

    return (
        <div
            ref={searchRef}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-[90%] max-w-md"
        >
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-12 pr-12 py-3.5 border-none rounded-full leading-5 bg-white shadow-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-700 transition-all"
                    placeholder="Rechercher une adresse..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
                {/* Hidden search button for accessibility/Enter key behavior simulation if needed, but KeyDown handles it */}
                <button
                    type="button"
                    onClick={handleSearch}
                    className="hidden"
                >
                    Search
                </button>
            </div>
        </div>
    );
};

// Marker Component
const LocationMarker = ({ position, setPosition, onLocationFound }) => {
    const map = useMap();
    const markerRef = useRef(null);

    // Handle map clicks
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationFound(e.latlng);
        }
    });

    // Update map center when position changes programmatically
    useEffect(() => {
        if (position) {
            const targetZoom = Math.max(map.getZoom(), 16);
            map.flyTo(position, targetZoom);
        }
    }, [position, map]);

    const eventHandlers = {
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const newPos = marker.getLatLng();
                setPosition(newPos);
                onLocationFound(newPos);
            }
        },
    };

    return position === null ? null : (
        <Marker
            position={position}
            draggable={true}
            eventHandlers={eventHandlers}
            ref={markerRef}
        />
    );
};

const LocationPicker = ({ onLocationSelect, initialLocation }) => {
    const [position, setPosition] = useState(initialLocation || null);
    const [address, setAddress] = useState('');
    const [loadingAddress, setLoadingAddress] = useState(false);

    // Reverse Geocoding
    // Reverse Geocoding with Debounce
    const timeoutRef = useRef(null);
    const abortControllerRef = useRef(null);

    const fetchAddress = async (latlng) => {
        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setLoadingAddress(true);

        // Debounce: Wait 1s before fetching
        timeoutRef.current = setTimeout(async () => {
            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&accept-language=fr`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    if (response.status === 429) {
                        throw new Error("Trop de requêtes. Veuillez patienter.");
                    }
                    throw new Error("Erreur réseau");
                }

                const data = await response.json();
                if (data && data.display_name) {
                    setAddress(data.display_name);
                    onLocationSelect({ lat: latlng.lat, lng: latlng.lng, address: data.display_name });
                } else {
                    setAddress("Adresse inconnue");
                    onLocationSelect({ lat: latlng.lat, lng: latlng.lng, address: "Adresse inconnue" });
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log("Fetch aborted");
                    return;
                }
                console.error("Erreur geocoding:", error);
                setAddress(error.message === "Trop de requêtes. Veuillez patienter." ? error.message : "Impossible de récupérer l'adresse");
            } finally {
                setLoadingAddress(false);
            }
        }, 1000);
    };



    // Sync with initialLocation
    useEffect(() => {
        if (initialLocation && !position) {
            setPosition(initialLocation);
            fetchAddress(initialLocation);
        }
    }, [initialLocation]);

    useEffect(() => {
        if (initialLocation && !address) {
            fetchAddress(initialLocation);
        }
    }, []);

    return (
        <div className="h-full flex flex-col gap-3">
            <div className="relative flex-1 w-full rounded-2xl overflow-hidden border border-gray-200 shadow-lg z-0">
                <MapContainer
                    center={initialLocation || { lat: 31.7917, lng: -7.0926 }}
                    zoom={initialLocation ? 15 : 6}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                    zoomControl={false} // Disable default zoom control
                >
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

                    <FloatingSearchBar onLocationFound={(latlng) => {
                        setPosition(latlng);
                        fetchAddress(latlng);
                    }} />

                    <MapControls onLocationFound={(latlng) => {
                        setPosition(latlng);
                        fetchAddress(latlng);
                    }} />

                    <LocationMarker
                        position={position}
                        setPosition={setPosition}
                        onLocationFound={fetchAddress}
                    />
                </MapContainer>
            </div>

            {/* Address Feedback */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 ${address ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                <div className={`p-2 rounded-full ${address ? 'bg-blue-100 text-primary' : 'bg-gray-200 text-gray-400'}`}>
                    <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 pt-1">
                    <p className="text-sm font-medium text-gray-800">
                        {loadingAddress ? (
                            <span className="animate-pulse flex items-center gap-2">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                Recherche de l'adresse...
                            </span>
                        ) : address ? (
                            <span className="text-primary-dark leading-relaxed">{address}</span>
                        ) : (
                            <span className="text-gray-400 italic">Aucune position sélectionnée</span>
                        )}
                    </p>
                    {position && (
                        <p className="text-xs text-gray-400 mt-1 font-mono">
                            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

LocationPicker.propTypes = {
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    onLocationChange: PropTypes.func.isRequired
};

LocationPicker.defaultProps = {
    latitude: 33.5731,
    longitude: -7.5898
};

export default LocationPicker;
