import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

const HeatmapLayer = ({ points }) => {
    const map = useMap();

    useEffect(() => {
        if (!points || points.length === 0) return;

        const heat = L.heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 10,
            gradient: {
                0.0: 'rgba(0,0,0,0)', // Transparent
                0.2: '#06b6d4',       // Cyan (Faible densité)
                0.5: '#8b5cf6',       // Violet (Moyenne)
                0.8: '#f59e0b',       // Orange (Forte)
                1.0: '#ef4444'        // Rouge vif (Critique)
            }
        }).addTo(map);

        return () => {
            map.removeLayer(heat);
        };
    }, [map, points]);

    return null;
};

export default HeatmapLayer;
