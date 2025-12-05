import React from 'react';
import { Search, Filter } from 'lucide-react';

const FilterBar = ({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus
}) => {
    return (
        <div className="sticky top-4 z-30 mb-6">
            <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">

                {/* Search */}
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher une demande..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <div className="relative min-w-[160px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer hover:border-gray-300 transition-colors"
                        >
                            <option value="">Toutes catégories</option>
                            <option value="ALIMENTAIRE">Alimentaire</option>
                            <option value="MEDICAL">Médical</option>
                            <option value="LOGISTIQUE">Logistique</option>
                            <option value="AUTRE">Autre</option>
                        </select>
                    </div>

                    <div className="relative min-w-[160px]">
                        <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${selectedStatus === 'RESOLU' ? 'bg-green-500' :
                                selectedStatus === 'EN_COURS' ? 'bg-orange-500' :
                                    selectedStatus === 'EN_ATTENTE' ? 'bg-yellow-500' : 'bg-gray-300'
                            }`} />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full pl-8 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer hover:border-gray-300 transition-colors"
                        >
                            <option value="">Tous statuts</option>
                            <option value="EN_ATTENTE">En attente</option>
                            <option value="EN_COURS">En cours</option>
                            <option value="RESOLU">Résolu</option>
                            <option value="REJETE">Rejeté</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
