import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, LayoutGrid, Ghost } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RequestCard from '../../components/dashboard/RequestCard';
import StatsOverview from '../../components/dashboard/StatsOverview';
import FilterBar from '../../components/dashboard/FilterBar';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import casService from '../../services/casService';

const Dashboard = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await casService.getMyCases();
                const mappedRequests = data.map(cas => ({
                    id: cas.id,
                    title: cas.titre,
                    description: cas.description,
                    category: cas.categorie,
                    status: cas.statut,
                    createdAt: cas.createdAt || new Date().toISOString(),
                    latitude: cas.latitude || 0,
                    longitude: cas.longitude || 0,
                    photosUrl: cas.photos
                }));
                setRequests(mappedRequests);
                // Simulate a slight delay for smooth skeleton transition if needed
                setTimeout(() => setIsLoading(false), 500);
            } catch (error) {
                console.error("Failed to fetch requests", error);
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette demande ?")) {
            try {
                await casService.deleteCase(id);
                setRequests(requests.filter(req => req.id !== id));
            } catch (error) {
                console.error("Erreur lors de la suppression", error);
                alert("Impossible de supprimer la demande.");
            }
        }
    };

    const handleEdit = (request) => {
        navigate(`/citizen/edit/${request.id}`);
    };

    const filteredRequests = requests.filter(request => {
        const matchCategory = selectedCategory ? request.category === selectedCategory : true;
        const matchStatus = selectedStatus ? request.status === selectedStatus : true;
        const matchSearch = searchQuery
            ? request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.description.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        return matchCategory && matchStatus && matchSearch;
    });

    // Calculate Stats
    const stats = {
        total: requests.length,
        active: requests.filter(r => r.status === 'EN_COURS' || r.status === 'EN_ATTENTE').length,
        resolved: requests.filter(r => r.status === 'RESOLU').length
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2"
                        >
                            Tableau de Bord
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-slate-500 text-lg"
                        >
                            Gérez vos demandes et suivez leur impact.
                        </motion.p>
                    </div>
                    <Link to="/citizen/declare">
                        <Button className="px-6 py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 font-bold text-base">
                            <Plus className="w-5 h-5" />
                            Nouvelle Demande
                        </Button>
                    </Link>
                </div>

                {/* Stats Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <StatsOverview stats={stats} />
                </motion.div>

                {/* Filter Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <FilterBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        selectedStatus={selectedStatus}
                        setSelectedStatus={setSelectedStatus}
                    />
                </motion.div>

                {/* Content Grid */}
                <div className="mt-8">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 h-[320px] flex flex-col gap-4">
                                    <Skeleton className="h-40 w-full rounded-xl" />
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <AnimatePresence mode='popLayout'>
                            {filteredRequests.length > 0 ? (
                                <motion.div
                                    layout
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                >
                                    {filteredRequests.map((request) => (
                                        <RequestCard
                                            key={request.id}
                                            request={request}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200"
                                >
                                    <div className="bg-gray-50 p-6 rounded-full mb-6">
                                        <Ghost className="w-12 h-12 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune demande trouvée</h3>
                                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                                        {requests.length > 0
                                            ? "Essayez de modifier vos filtres pour voir plus de résultats."
                                            : "Vous n'avez pas encore créé de demande. Lancez-vous dès maintenant !"}
                                    </p>
                                    {requests.length === 0 && (
                                        <Link to="/citizen/declare">
                                            <Button variant="outline" className="border-gray-200 hover:bg-gray-50 text-gray-700">
                                                Créer ma première demande
                                            </Button>
                                        </Link>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
