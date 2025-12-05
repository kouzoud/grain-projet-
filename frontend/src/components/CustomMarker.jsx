import React from 'react';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Utensils, HeartPulse, Package, Users, MapPin } from 'lucide-react';

const getIconForCategory = (category) => {
    switch (category) {
        case 'ALIMENTAIRE': return <Utensils size={20} className="text-white" />;
        case 'MEDICAL': return <HeartPulse size={20} className="text-white" />;
        case 'LOGISTIQUE': return <Package size={20} className="text-white" />;
        case 'SOCIAL': return <Users size={20} className="text-white" />;
        default: return <MapPin size={20} className="text-white" />;
    }
};

const getColorForCategory = (category) => {
    switch (category) {
        case 'ALIMENTAIRE': return 'bg-orange-500';
        case 'MEDICAL': return 'bg-red-500';
        case 'LOGISTIQUE': return 'bg-blue-500';
        case 'SOCIAL': return 'bg-purple-500';
        default: return 'bg-gray-500';
    }
};

export const createCustomIcon = (category) => {
    const iconComponent = getIconForCategory(category);
    const colorClass = getColorForCategory(category);

    const iconHtml = renderToStaticMarkup(
        <div className={`w-10 h-10 rounded-full ${colorClass} border-4 border-white shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200`}>
            {iconComponent}
        </div>
    );

    return L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-icon', // Custom class to avoid default styles
        iconSize: [40, 40],
        iconAnchor: [20, 20], // Center
        popupAnchor: [0, -20]
    });
};
