import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RequestCard from '../../components/RequestCard';
import adminService from '../../services/adminService';
import { Users, CheckCircle, Clock, Activity, AlertCircle, Map as MapIcon } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

// Configuration des Couleurs pour les graphiques
const CHART_COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'];

// Custom Tooltip pour les graphiques
const CustomTooltip = ({ active, payload, label, isDark }) => {
    if (active && payload && payload.length) {
        return (
            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border p-3 rounded-lg shadow-lg`}>
                <p className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const AdminDashboard = () => {
    const { t, i18n } = useTranslation();
    const [stats, setStats] = useState(null);
    const [recentCases, setRecentCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const isRTL = i18n.language === 'ar';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const statsData = await adminService.getStats();
            console.log("Données Stats reçues :", statsData);
            setStats(statsData);

            const casesData = await adminService.getAllCases();
            const sortedCases = casesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
            setRecentCases(sortedCases);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    const pieData = stats?.casesByCategory ? Object.entries(stats.casesByCategory).map(([name, value]) => ({ name, value })) : [];
    const barData = stats?.casesByDate ? Object.entries(stats.casesByDate).map(([date, count]) => ({ date, count })) : [];

    // Couleurs pour les axes en fonction du thème
    const axisColor = isDark ? '#94a3b8' : '#6b7280';
    const gridColor = isDark ? '#334155' : '#e5e7eb';

    return (
        <div className={`min-h-screen p-4 md:p-6 lg:p-8 font-sans bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white transition-colors duration-200 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <main className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t('dashboard.admin.dashboard.title')}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{t('dashboard.admin.dashboard.subtitle')}</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/map')}
                        className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                    >
                        <MapIcon className="w-4 h-4" />
                        {t('dashboard.admin.dashboard.strategicMap')}
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                    <KpiCard title={t('dashboard.admin.dashboard.totalRequests')} value={stats?.totalCases || 0} icon={Activity} color="cyan" />
                    <KpiCard title={t('dashboard.admin.dashboard.pending')} value={stats?.pendingCases || 0} icon={Clock} color="amber" />
                    <KpiCard title={t('dashboard.admin.dashboard.resolved')} value={stats?.resolvedCases || 0} icon={CheckCircle} color="emerald" />
                    <KpiCard title={t('dashboard.admin.dashboard.rejected')} value={stats?.rejectedCases || 0} icon={AlertCircle} color="red" />
                    <KpiCard title={t('dashboard.admin.dashboard.activeVolunteers')} value={stats?.activeVolunteers || 0} icon={Users} color="violet" />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {/* Pie Chart */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-lg dark:shadow-slate-900/50 rounded-2xl p-6 transition-colors">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('dashboard.admin.dashboard.categoryDistribution')}</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                                    <Legend 
                                        wrapperStyle={{ color: axisColor }} 
                                        formatter={(value) => <span className="text-gray-600 dark:text-gray-400">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-lg dark:shadow-slate-900/50 rounded-2xl p-6 transition-colors">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('dashboard.admin.dashboard.evolution')}</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke={axisColor}
                                        tick={{ fill: axisColor }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke={axisColor}
                                        tick={{ fill: axisColor }}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                                    <Bar
                                        dataKey="count"
                                        fill="#06b6d4"
                                        radius={[4, 4, 0, 0]}
                                        barSize={30}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Cases List */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t('dashboard.admin.dashboard.recentRequests')}</h2>
                    {recentCases.length === 0 ? (
                        <div className="text-center py-12 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-500 dark:text-gray-400 shadow-lg transition-colors">
                            {t('dashboard.admin.dashboard.noRecentRequests')}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentCases.map((cas) => (
                                <div key={cas.id} className="transform hover:scale-[1.01] transition-transform duration-300">
                                    <RequestCard request={cas} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const KpiCard = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
        cyan: {
            icon: 'text-cyan-500',
            bg: 'bg-cyan-50 dark:bg-cyan-500/10',
            ring: 'ring-cyan-500/20'
        },
        amber: {
            icon: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            ring: 'ring-amber-500/20'
        },
        emerald: {
            icon: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            ring: 'ring-emerald-500/20'
        },
        red: {
            icon: 'text-red-500',
            bg: 'bg-red-50 dark:bg-red-500/10',
            ring: 'ring-red-500/20'
        },
        violet: {
            icon: 'text-violet-500',
            bg: 'bg-violet-50 dark:bg-violet-500/10',
            ring: 'ring-violet-500/20'
        }
    };

    const classes = colorClasses[color] || colorClasses.cyan;

    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-lg dark:shadow-slate-900/50 rounded-2xl p-5 flex items-center justify-between hover:border-gray-300 dark:hover:border-slate-700 transition-all duration-200">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-xl ${classes.bg}`}>
                <Icon className={`w-6 h-6 ${classes.icon}`} />
            </div>
        </div>
    );
};

export default AdminDashboard;
