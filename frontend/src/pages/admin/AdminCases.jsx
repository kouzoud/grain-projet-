import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { CheckCircle, XCircle, Filter, LayoutGrid, List } from 'lucide-react';
import RequestCard from '../../components/RequestCard';
import RequestKanban from './RequestKanban';
import ExportControl from '../../components/admin/ExportControl';

const AdminCases = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('EN_ATTENTE'); // Default filter
    const [viewMode, setViewMode] = useState('KANBAN'); // 'LIST' or 'KANBAN'

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const data = await adminService.getAllCases();
            setCases(data);
        } catch (error) {
            console.error("Error fetching cases:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await adminService.updateCaseStatus(id, newStatus);
            // Refresh list or update local state
            setCases(cases.map(c => c.id === id ? { ...c, statut: newStatus } : c));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Erreur lors de la mise à jour du statut");
        }
    };

    const filteredCases = cases.filter(c => {
        if (filter === 'ALL') return true;
        return c.statut === filter;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Demandes</h1>

                <div className="flex items-center gap-4">
                    <ExportControl />

                    {/* View Toggle */}
                    <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex">
                        <button
                            onClick={() => setViewMode('KANBAN')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'KANBAN' ? 'bg-gray-100 text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Vue Kanban"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('LIST')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'LIST' ? 'bg-gray-100 text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Vue Liste"
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Filter (Only for List View) */}
                    {viewMode === 'LIST' && (
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="border-none focus:ring-0 text-sm text-gray-700 outline-none"
                            >
                                <option value="EN_ATTENTE">En Attente</option>
                                <option value="EN_COURS">En Cours</option>
                                <option value="RESOLU">Résolues</option>
                                <option value="REJETE">Rejetées</option>
                                <option value="ALL">Toutes</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {viewMode === 'KANBAN' ? (
                <div className="flex-1 overflow-hidden">
                    <RequestKanban cases={cases} onStatusUpdate={handleStatusUpdate} />
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto">
                    {filteredCases.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm">
                            Aucune demande trouvée pour ce filtre.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                            {filteredCases.map((cas) => (
                                <RequestCard
                                    key={cas.id}
                                    request={cas}
                                    customActions={
                                        cas.statut === 'EN_ATTENTE' && (
                                            <div className="flex gap-2 ml-2">
                                                <button
                                                    onClick={() => handleStatusUpdate(cas.id, 'EN_COURS')}
                                                    className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded-full transition-colors"
                                                    title="Valider"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(cas.id, 'REJETE')}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded-full transition-colors"
                                                    title="Rejeter"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminCases;
