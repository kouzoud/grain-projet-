import React, { useState, useEffect } from 'react';
import KanbanCard from '../../components/admin/KanbanCard';
import RequestModal from '../../components/RequestModal';
import { Layers, AlertCircle, CheckCircle, Clock, Activity } from 'lucide-react';

const RequestKanban = ({ cases, onStatusUpdate }) => {
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
        <div className="flex flex-col h-full min-h-[calc(100vh-200px)] bg-gray-900/50 rounded-xl border border-gray-800">
            {/* Header */}
            <div className={`p-4 border-b-2 ${borderColor} bg-gray-800/50 rounded-t-xl flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <h3 className="font-bold text-gray-200">{title}</h3>
                </div>
                <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium">
                    {items.length}
                </span>
            </div>

            {/* Content */}
            <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                {items.length === 0 ? (
                    <div className="text-center py-10 text-gray-600 italic text-sm">
                        Aucune demande
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full overflow-x-auto pb-4">
                <KanbanColumn
                    title="À Valider"
                    icon={Clock}
                    color="text-yellow-500"
                    borderColor="border-yellow-500"
                    items={columns.todo}
                />
                <KanbanColumn
                    title="Ouvertes"
                    icon={AlertCircle}
                    color="text-cyan-500"
                    borderColor="border-cyan-500"
                    items={columns.open}
                />
                <KanbanColumn
                    title="En Intervention"
                    icon={Activity}
                    color="text-purple-500"
                    borderColor="border-purple-500"
                    items={columns.progress}
                />
                <KanbanColumn
                    title="Terminées"
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
