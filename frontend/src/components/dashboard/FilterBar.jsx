import React from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FilterBar = ({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus
}) => {
    const { t } = useTranslation();
    const hasActiveFilters = searchQuery || selectedCategory || selectedStatus;

    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSelectedStatus('');
    };

    const categoryOptions = [
        { value: '', label: t('map.allCategories'), color: 'bg-gray-400' },
        { value: 'ALIMENTAIRE', label: t('newRequest.categories.ALIMENTAIRE'), color: 'bg-amber-500' },
        { value: 'MEDICAL', label: t('newRequest.categories.MEDICAL'), color: 'bg-rose-500' },
        { value: 'LOGISTIQUE', label: t('newRequest.categories.LOGISTIQUE'), color: 'bg-indigo-500' },
        { value: 'AUTRE', label: t('newRequest.categories.AUTRE'), color: 'bg-slate-500' }
    ];

    const statusOptions = [
        { value: '', label: t('map.allStatuses'), color: 'bg-gray-300' },
        { value: 'EN_ATTENTE', label: t('status.EN_ATTENTE'), color: 'bg-yellow-400' },
        { value: 'VALIDE', label: t('status.VALIDE'), color: 'bg-cyan-400' },
        { value: 'EN_COURS', label: t('status.EN_COURS'), color: 'bg-orange-400' },
        { value: 'RESOLU', label: t('status.RESOLU'), color: 'bg-emerald-400' },
        { value: 'REJETE', label: t('status.REFUSE'), color: 'bg-red-400' }
    ];

    const getStatusColor = () => {
        const option = statusOptions.find(o => o.value === selectedStatus);
        return option ? option.color : 'bg-gray-300';
    };

    const getCategoryColor = () => {
        const option = categoryOptions.find(o => o.value === selectedCategory);
        return option ? option.color : 'bg-gray-400';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-4 z-30 mb-6"
        >
            <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-slate-700/50 shadow-lg shadow-gray-200/30 dark:shadow-slate-900/30 rounded-2xl p-4">
                {/* Subtle gradient border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 via-transparent to-violet-500/5 pointer-events-none" />

                <div className="relative flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-0">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 rtl:left-auto rtl:right-4">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder={t('dashboard.citizen.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rtl:pl-4 rtl:pr-12 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200/60 dark:border-slate-600/50 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/40 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200 outline-none text-sm font-medium"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors rtl:right-auto rtl:left-3"
                            >
                                <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            </button>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="hidden lg:block w-px h-10 bg-gray-200 dark:bg-slate-700" />

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                        {/* Category Filter */}
                        <div className="relative min-w-[180px]">
                            <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${getCategoryColor()} ring-2 ring-white dark:ring-slate-800 shadow-sm`} />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full pl-9 pr-10 py-3 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200/60 dark:border-slate-600/50 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/40 focus:bg-white dark:focus:bg-slate-800 outline-none appearance-none cursor-pointer hover:border-gray-300 dark:hover:border-slate-500 transition-all duration-200"
                            >
                                {categoryOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <SlidersHorizontal className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="relative min-w-[160px]">
                            <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${getStatusColor()} ring-2 ring-white dark:ring-slate-800 shadow-sm animate-pulse`} />
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full pl-9 pr-10 py-3 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200/60 dark:border-slate-600/50 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/40 focus:bg-white dark:focus:bg-slate-800 outline-none appearance-none cursor-pointer hover:border-gray-300 dark:hover:border-slate-500 transition-all duration-200"
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Clear Filters Button */}
                        {hasActiveFilters && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={clearAllFilters}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors"
                            >
                                <X className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('dashboard.citizen.clear')}</span>
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default FilterBar;
