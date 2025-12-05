import React, { useEffect, useState } from 'react';
import VolunteerNavBar from '../../components/VolunteerNavBar';
import RequestCard from '../../components/RequestCard';
import StatsWidget from '../../components/StatsWidget';
import casService from '../../services/casService';
import { Sparkles } from 'lucide-react';

const VolunteerDashboard = () => {
    const [cases, setCases] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("TOUTES");

    const CATEGORIES = ["TOUTES", "ALIMENTAIRE", "MEDICAL", "LOGISTIQUE", "VETEMENTS", "LOGEMENT", "AUTRE"];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [casesData, statsData] = await Promise.all([
                    casService.getValidatedCases(),
                    casService.getVolunteerStats()
                ]);

                const mappedCases = casesData.map(cas => ({
                    id: cas.id,
                    title: cas.titre,
                    description: cas.description,
                    category: cas.categorie,
                    status: cas.statut,
                    createdAt: cas.createdAt || new Date().toISOString(),
                    latitude: cas.latitude || 0,
                    longitude: cas.longitude || 0,
                    photosUrl: cas.photos,
                    distance: cas.distance
                }));
                setCases(mappedCases);
                setStats(statsData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredCases = cases.filter(c =>
        selectedCategory === "TOUTES" || c.category === selectedCategory
    );

    // Default stats if fetch fails or user is new
    const displayStats = stats || {
        level: 'Bronze',
        points: 0,
        nextLevelPoints: 200,
        missionsCompleted: 0,
        hoursVolunteered: 0,
        impactScore: 0
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <VolunteerNavBar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Bonjour, Bénévole 👋</h1>
                    <p className="text-gray-600 mt-1">Prêt à faire la différence aujourd'hui ?</p>
                </div>

                {/* Stats Widget */}
                <StatsWidget stats={displayStats} />

                {/* Recommended Missions (Mocked Logic for UI) */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="text-yellow-500" size={20} />
                        <h2 className="text-xl font-bold text-gray-800">Recommandé pour vous</h2>
                    </div>
                    {loading ? (
                        <div className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {cases.slice(0, 3).map((cas) => (
                                <RequestCard key={cas.id} request={cas} isVolunteer={true} />
                            ))}
                        </div>
                    )}
                </div>

                {/* All Missions Filter & Grid */}
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Toutes les missions</h2>

                    <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 no-scrollbar w-full sm:w-auto">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat
                                    ? 'bg-primary text-white shadow-md transform scale-105'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {cat.charAt(0) + cat.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : filteredCases.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg">Aucune mission disponible pour cette catégorie.</p>
                        <button
                            onClick={() => setSelectedCategory("TOUTES")}
                            className="mt-4 text-primary font-medium hover:underline"
                        >
                            Voir toutes les missions
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCases.map((cas) => (
                            <RequestCard key={cas.id} request={cas} isVolunteer={true} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default VolunteerDashboard;
