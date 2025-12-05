import React from 'react';
import { LayoutDashboard, Clock, CheckCircle2 } from 'lucide-react';

const StatsOverview = ({ stats }) => {
    const items = [
        {
            label: 'Total Demandes',
            value: stats.total,
            icon: LayoutDashboard,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-100'
        },
        {
            label: 'En Cours',
            value: stats.active,
            icon: Clock,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            border: 'border-orange-100'
        },
        {
            label: 'Résolues',
            value: stats.resolved,
            icon: CheckCircle2,
            color: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-100'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {items.map((item, index) => (
                <div
                    key={index}
                    className={`p-4 rounded-2xl border ${item.border} ${item.bg} flex items-center gap-4 transition-transform hover:scale-[1.02]`}
                >
                    <div className={`p-3 rounded-xl bg-white shadow-sm ${item.color}`}>
                        <item.icon size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{item.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsOverview;
