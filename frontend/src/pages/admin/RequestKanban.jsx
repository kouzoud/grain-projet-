import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import KanbanCard from '../../components/admin/KanbanCard';
import RequestModal from '../../components/RequestModal';
import { Layers, AlertCircle, CheckCircle, Clock, Activity } from 'lucide-react';

const RequestKanban = ({ cases, onStatusUpdate }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [columns, setColumns] = useState({
        todo: [],
        open: [],
        progress: [],
        done: []
    });
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        if (cases) {
            organizeCases(cases);
        }
    }, [cases]);

    const organizeCases = (data) => {
        const newColumns = {
            todo: data.filter(c => ['EN_ATTENTE', 'EN_ATTENTE_VALIDATION'].includes(c.statut)),
            open: data.filter(c => ['VALIDE'].includes(c.statut)),
            progress: data.filter(c => ['EN_COURS', 'PRIS_EN_CHARGE'].includes(c.statut)),
            done: data.filter(c => c.statut === 'RESOLU')
        };
        setColumns(newColumns);
    };

    const handleCardClick = (request) => {
        setSelectedRequest(request);
    };

    const handleCloseModal = () => {
        setSelectedRequest(null);
    };

    const handleModalStatusUpdate = (id, newStatus) => {
        onStatusUpdate(id, newStatus);
        setSelectedRequest(null); // Close modal after update
    };

    const KanbanColumn = ({ title, icon: Icon, color, items, borderColor }) => (
        <div className="flex flex-col h-full min-h-[calc(100vh-200px)] bg-white dark:bg-slate-900/50 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-lg transition-colors">
            {/* Header */}
            <div className={`p-4 border-b-2 ${borderColor} bg-gray-50 dark:bg-slate-800/50 rounded-t-2xl flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <h3 className="font-bold text-gray-900 dark:text-gray-200">{title}</h3>
                </div>
                <span className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full text-xs font-medium">
                    {items.length}
                </span>
            </div>

            {/* Content */}
            <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                {items.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 dark:text-gray-600 italic text-sm">
                        {isRTL ? 'لا توجد طلبات' : 'Aucune demande'}
                    </div>
                ) : (
                    items.map(item => (
                        <KanbanCard
                            key={item.id}
                            request={item}
                            onClick={handleCardClick}
                        />
                    ))
                )}
            </div>
        </div>
    );

    return (
        <>
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full overflow-x-auto pb-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <KanbanColumn
                    title={isRTL ? 'للتحقق' : 'À Valider'}
                    icon={Clock}
                    color="text-yellow-500"
                    borderColor="border-yellow-500"
                    items={columns.todo}
                />
                <KanbanColumn
                    title={isRTL ? 'مفتوحة' : 'Ouvertes'}
                    icon={AlertCircle}
                    color="text-cyan-500"
                    borderColor="border-cyan-500"
                    items={columns.open}
                />
                <KanbanColumn
                    title={isRTL ? 'قيد التدخل' : 'En Intervention'}
                    icon={Activity}
                    color="text-purple-500"
                    borderColor="border-purple-500"
                    items={columns.progress}
                />
                <KanbanColumn
                    title={isRTL ? 'مكتملة' : 'Terminées'}
                    icon={CheckCircle}
                    color="text-green-500"
                    borderColor="border-green-500"
                    items={columns.done}
                />
            </div>

            {selectedRequest && (
                <RequestModal
                    request={selectedRequest}
                    onClose={handleCloseModal}
                    onStatusUpdate={handleModalStatusUpdate}
                    isReadOnly={false} // Admin can edit
                />
            )}
        </>
    );
};

export default RequestKanban;
