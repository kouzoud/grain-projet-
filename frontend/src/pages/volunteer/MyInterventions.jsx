import React, { useState, useEffect } from 'react';
import casService from '../../services/casService';
import { CheckCircle, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { defaultImage, getSingleImageUrl } from '../../utils/imageUtils';

const MyInterventions = () => {
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInterventions();
    }, []);

    const fetchInterventions = async () => {
        try {
            const data = await casService.getMyInterventions();
            setInterventions(data);
        } catch (error) {
            console.error("Failed to fetch interventions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir marquer ce cas comme résolu ? Cette action est irréversible.")) {
            try {
                await casService.resolveCase(id);
                fetchInterventions(); // Refresh list
            } catch (error) {
                console.error("Failed to resolve case", error);
                alert("Erreur lors de la clôture du cas.");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CheckCircle className="w-8 h-8 text-primary" />
                Mes Missions
            </h1>

            {interventions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Vous n'avez aucune mission en cours.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {interventions.map((cas) => (
                        <div key={cas.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={getSingleImageUrl(cas.photos?.[0]) || defaultImage}
                                    alt={cas.titre}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                                />
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${cas.statut === 'RESOLU' ? 'bg-blue-100 text-blue-800' :
                                        cas.statut === 'PRIS_EN_CHARGE' ? 'bg-purple-100 text-purple-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {cas.statut}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{cas.titre}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{cas.description}</p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                                        <span>{cas.latitude.toFixed(4)}, {cas.longitude.toFixed(4)}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                                        <span>{new Date(cas.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {cas.statut !== 'RESOLU' && (
                                    <button
                                        onClick={() => handleResolve(cas.id)}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Marquer comme Résolu
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyInterventions;
