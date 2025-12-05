import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader2, CheckCircle2, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StatsOverview = ({ stats }) => {
    const { t } = useTranslation();
    
    const items = [
        {
            label: t('dashboard.citizen.stats.total'),
            value: stats.total,
            icon: FileText,
            gradient: 'from-cyan-500 to-blue-600',
            iconBg: 'bg-cyan-500/10',
            iconColor: 'text-cyan-500',
            trend: '+12%',
            trendUp: true
        },
        {
            label: t('dashboard.citizen.stats.inProgress'),
            value: stats.active,
            icon: Loader2,
            gradient: 'from-violet-500 to-purple-600',
            iconBg: 'bg-violet-500/10',
            iconColor: 'text-violet-500',
            trend: stats.active > 0 ? t('common.active') : '—',
            trendUp: null
        },
        {
            label: t('dashboard.citizen.stats.completed'),
            value: stats.resolved,
            icon: CheckCircle2,
            gradient: 'from-emerald-500 to-teal-600',
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-500',
            trend: stats.total > 0 ? `${Math.round((stats.resolved / stats.total) * 100)}%` : '0%',
            trendUp: true
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8"
        >
            {items.map((item, index) => (
                <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="group relative overflow-hidden"
                >
                    {/* Card */}
                    <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-gray-100/80 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm">
                        {/* Gradient Accent Line */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} rounded-t-2xl opacity-80`} />

                        <div className="flex items-start justify-between">
                            {/* Icon */}
                            <div className={`${item.iconBg} dark:bg-opacity-20 p-3.5 rounded-xl`}>
                                <item.icon className={`w-6 h-6 ${item.iconColor}`} strokeWidth={2} />
                            </div>

                            {/* Trend Badge */}
                            {item.trend && (
                                <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    item.trendUp === true
                                        ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                        : item.trendUp === false
                                        ? 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                                        : 'bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400'
                                }`}>
                                    {item.trendUp === true && <TrendingUp className="w-3 h-3" />}
                                    {item.trend}
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                {item.value}
                            </p>
                        </div>

                        {/* Decorative blur */}
                        <div className={`absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br ${item.gradient} opacity-5 dark:opacity-10 rounded-full blur-2xl group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity`} />
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default StatsOverview;
