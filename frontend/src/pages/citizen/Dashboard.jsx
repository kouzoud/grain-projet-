import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Inbox, Sparkles, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import RequestCard from '../../components/dashboard/RequestCard';
import StatsOverview from '../../components/dashboard/StatsOverview';
import FilterBar from '../../components/dashboard/FilterBar';
import Button from '../../components/ui/Button';
import casService from '../../services/casService';

// Skeleton Card Component
const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-full">
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        <div className="p-5 space-y-4">
            <div className="h-5 bg-gray-200 rounded-lg w-3/4 animate-pulse" />
            <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
            </div>
            <div className="pt-4 border-t border-gray-50 flex gap-4">
                <div className="h-3 bg-gray-100 rounded w-20 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-16 animate-pulse" />
            </div>
            <div className="flex gap-2 pt-2">
                <div className="h-10 bg-gray-100 rounded-xl flex-1 animate-pulse" />
                <div className="h-10 w-10 bg-gray-100 rounded-xl animate-pulse" />
            </div>
        </div>
    </div>
);

// Empty State Component
const EmptyState = ({ hasFilters, onClear, t }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="flex flex-col items-center justify-center py-20 text-center"
    >
        <div className="relative mb-8">
            {/* Decorative circles */}
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 rounded-full blur-2xl" />
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 p-8 rounded-3xl border border-gray-200/50 dark:border-slate-600/50 shadow-sm">
                <Inbox className="w-16 h-16 text-gray-300 dark:text-slate-500" strokeWidth={1.5} />
            </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {hasFilters ? t('dashboard.citizen.emptyState.noResults') : t('dashboard.citizen.emptyState.title')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
            {hasFilters
                ? t('dashboard.citizen.emptyState.noResultsDesc')
                : t('dashboard.citizen.emptyState.description')}
        </p>

        {hasFilters ? (
            <Button
                onClick={onClear}
                variant="outline"
                className="border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium"
            >
                <RefreshCw className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                {t('dashboard.citizen.emptyState.clearFilters')}
            </Button>
        ) : (
            <Link to="/citizen/declare">
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
                >
                    <Sparkles className="w-5 h-5" />
                    {t('dashboard.citizen.emptyState.cta')}
                </motion.button>
            </Link>
        )}
    </motion.div>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mt-10"
        >
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-1.5">
                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => onPageChange(1)}
                            className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>}
                    </>
                )}

                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-10 h-10 rounded-xl font-medium transition-all ${
                            page === currentPage
                                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>}
                        <button
                            onClick={() => onPageChange(totalPages)}
                            className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            {totalPages}
                        </button>
                    </>
                )}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </motion.div>
    );
};

const ITEMS_PER_PAGE = 12;

const Dashboard = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
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
                setTimeout(() => setIsLoading(false), 600);
            } catch (error) {
                console.error("Failed to fetch requests", error);
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, []);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory, selectedStatus]);

    const handleDelete = async (id) => {
        const confirmMessage = isRTL 
            ? "هل أنت متأكد أنك تريد حذف هذا الطلب؟" 
            : "Êtes-vous sûr de vouloir supprimer cette demande ?";
        if (window.confirm(confirmMessage)) {
            try {
                await casService.deleteCase(id);
                setRequests(requests.filter(req => req.id !== id));
            } catch (error) {
                console.error("Erreur lors de la suppression", error);
                const errorMessage = isRTL 
                    ? "لا يمكن حذف الطلب." 
                    : "Impossible de supprimer la demande.";
                alert(errorMessage);
            }
        }
    };

    const handleEdit = (request) => {
        navigate(`/citizen/edit/${request.id}`);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSelectedStatus('');
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

    // Pagination logic
    const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
    const paginatedRequests = filteredRequests.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const hasActiveFilters = searchQuery || selectedCategory || selectedStatus;

    // Calculate Stats
    const stats = {
        total: requests.length,
        active: requests.filter(r => r.status === 'EN_COURS' || r.status === 'EN_ATTENTE' || r.status === 'VALIDE').length,
        resolved: requests.filter(r => r.status === 'RESOLU').length
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.06
            }
        }
    };

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-10 font-sans text-slate-900 dark:text-gray-100 transition-colors duration-200 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Subtle background pattern */}
            <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50 pointer-events-none" />

            <div className="relative max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 100 }}
                    >
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2 flex items-center gap-3">
                            {t('dashboard.citizen.title')}
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-sm font-bold">
                                {requests.length}
                            </span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
                            {t('dashboard.citizen.subtitle')}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
                    >
                        <Link to="/citizen/declare">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all overflow-hidden"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                <Plus className="w-5 h-5" strokeWidth={2.5} />
                                {t('navbar.newRequest')}
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>

                {/* Stats Overview */}
                <StatsOverview stats={stats} />

                {/* Filter Bar */}
                <FilterBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                />

                {/* Results Count */}
                {!isLoading && filteredRequests.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between mb-6"
                    >
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('dashboard.citizen.requestCount', { count: filteredRequests.length })}
                            {hasActiveFilters && <span className="text-cyan-600 dark:text-cyan-400 ml-1 rtl:ml-0 rtl:mr-1">({t('dashboard.citizen.filtered')})</span>}
                        </p>
                        {totalPages > 1 && (
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                {t('dashboard.citizen.pagination', { current: currentPage, total: totalPages })}
                            </p>
                        )}
                    </motion.div>
                )}

                {/* Content Grid */}
                <div className="mt-2">
                    {isLoading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {[...Array(8)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </motion.div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {paginatedRequests.length > 0 ? (
                                <motion.div
                                    key={`page-${currentPage}-${searchQuery}-${selectedCategory}-${selectedStatus}`}
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, y: -20 }}
                                    layout
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                >
                                    {paginatedRequests.map((request, index) => (
                                        <RequestCard
                                            key={request.id}
                                            request={request}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            index={index}
                                        />
                                    ))}
                                </motion.div>
                            ) : (
                                <EmptyState 
                                    hasFilters={hasActiveFilters} 
                                    onClear={clearFilters}
                                    t={t}
                                />
                            )}
                        </AnimatePresence>
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && paginatedRequests.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
