import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import adminService from '../../services/adminService';
import { CheckCircle, XCircle, Filter, LayoutGrid, List } from 'lucide-react';
import RequestCard from '../../components/RequestCard';
import RequestKanban from './RequestKanban';
import ExportControl from '../../components/admin/ExportControl';

const AdminCases = () => {
    const { t, i18n } = useTranslation();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('EN_ATTENTE'); // Default filter
    const [viewMode, setViewMode] = useState('KANBAN'); // 'LIST' or 'KANBAN'
    const isRTL = i18n.language === 'ar';

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
            <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)] flex flex-col bg-gray-50 dark:bg-slate-950 transition-colors ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.admin.cases.title')}</h1>

                <div className="flex items-center gap-4">
                    <ExportControl />

                    {/* View Toggle */}
                    <div className="bg-white dark:bg-slate-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex">
                        <button
                            onClick={() => setViewMode('KANBAN')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'KANBAN' ? 'bg-gray-100 dark:bg-slate-700 text-cyan-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            title={isRTL ? 'عرض كانبان' : 'Vue Kanban'}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('LIST')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'LIST' ? 'bg-gray-100 dark:bg-slate-700 text-cyan-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            title={isRTL ? 'عرض القائمة' : 'Vue Liste'}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Filter (Only for List View) */}
                    {viewMode === 'LIST' && (
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="border-none focus:ring-0 text-sm text-gray-700 dark:text-gray-300 bg-transparent outline-none"
                            >
                                <option value="EN_ATTENTE">{t('status.EN_ATTENTE')}</option>
                                <option value="EN_COURS">{t('status.EN_COURS')}</option>
                                <option value="RESOLU">{t('status.RESOLU')}</option>
                                <option value="REJETE">{t('status.REFUSE')}</option>
                                <option value="ALL">{t('common.all')}</option>
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
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                            {isRTL ? 'لم يتم العثور على طلبات لهذا الفلتر.' : 'Aucune demande trouvée pour ce filtre.'}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                            {filteredCases.map((cas) => (
                                <RequestCard
                                    key={cas.id}
                                    request={cas}
                                    customActions={
                                        cas.statut === 'EN_ATTENTE' && (
                                            <div className={`flex gap-2 ${isRTL ? 'mr-2' : 'ml-2'}`}>
                                                <button
                                                    onClick={() => handleStatusUpdate(cas.id, 'EN_COURS')}
                                                    className="text-green-600 hover:text-green-900 bg-green-50 dark:bg-green-500/20 p-1 rounded-full transition-colors"
                                                    title={t('dashboard.admin.validation.validate')}
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(cas.id, 'REJETE')}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 dark:bg-red-500/20 p-1 rounded-full transition-colors"
                                                    title={t('dashboard.admin.validation.reject')}
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
