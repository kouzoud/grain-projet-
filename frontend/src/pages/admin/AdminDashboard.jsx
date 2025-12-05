import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RequestCard from '../../components/RequestCard';
import adminService from '../../services/adminService';
import { Users, CheckCircle, Clock, Activity, AlertCircle, Map as MapIcon } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

// 1. Configuration des Couleurs (Constantes)
const COLORS = {
    bg: '#0f172a',      // Fond très sombre
    card: '#1e293b',    // Fond des cartes
    text: '#94a3b8',    // Texte gris clair
    grid: '#334155',    // Lignes de grille discrètes
    primary: '#06b6d4', // Cyan (Neon)
    secondary: '#8b5cf6', // Violet (Neon)
    accent: '#f59e0b',  // Orange (Neon)
    success: '#10b981', // Vert
    danger: '#ef4444',  // Rouge
};

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.success];

// 2. Création d'un "Custom Tooltip"
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-lg text-white">
                <p className="font-bold mb-1">{label}</p>
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
    const [stats, setStats] = useState(null);
    const [recentCases, setRecentCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const statsData = await adminService.getStats();
            console.log("Données Stats reçues :", statsData);
            setStats(statsData);

            const casesData = await adminService.getAllCases();
            // Sort by date desc and take top 5
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
            <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: COLORS.bg }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }}></div>
            </div>
        );
    }

    const pieData = stats?.casesByCategory ? Object.entries(stats.casesByCategory).map(([name, value]) => ({ name, value })) : [];
    const barData = stats?.casesByDate ? Object.entries(stats.casesByDate).map(([date, count]) => ({ date, count })) : [];

    return (
        <div className="min-h-screen p-4 font-sans" style={{ backgroundColor: COLORS.bg, color: 'white' }}>
            <main className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Tableau de Bord Admin</h1>
                        <p style={{ color: COLORS.text }}>Vue d'ensemble et analytique</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/map')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20"
                    >
                        <MapIcon className="w-4 h-4" />
                        Carte Stratégique
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <KpiCard title="Total Demandes" value={stats?.totalCases || 0} icon={Activity} color={COLORS.primary} />
                    <KpiCard title="En Attente" value={stats?.pendingCases || 0} icon={Clock} color={COLORS.accent} />
                    <KpiCard title="Résolues" value={stats?.resolvedCases || 0} icon={CheckCircle} color={COLORS.success} />
                    <KpiCard title="Rejetées" value={stats?.rejectedCases || 0} icon={AlertCircle} color={COLORS.danger} />
                    <KpiCard title="Bénévoles Actifs" value={stats?.activeVolunteers || 0} icon={Users} color={COLORS.secondary} />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pie Chart */}
                    <div className="bg-slate-900 border border-slate-800 shadow-xl rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Répartition par Catégorie</h3>
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
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ color: COLORS.text }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-slate-900 border border-slate-800 shadow-xl rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Évolution (7 derniers jours)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke={COLORS.text}
                                        tick={{ fill: COLORS.text }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke={COLORS.text}
                                        tick={{ fill: COLORS.text }}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="count"
                                        fill={COLORS.primary}
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
                    <h2 className="text-2xl font-bold mb-6 text-white">Dernières Demandes Reçues</h2>
                    {recentCases.length === 0 ? (
                        <div className="text-center py-12 rounded-xl shadow-sm" style={{ backgroundColor: COLORS.card, color: COLORS.text }}>
                            Aucune demande récente.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentCases.map((cas) => (
                                <div key={cas.id} className="transform hover:scale-[1.01] transition-transform duration-300">
                                    <RequestCard request={cas} darkMode={true} />
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
    return (
        <div className="bg-slate-900 border border-slate-800 shadow-xl rounded-xl p-6 flex items-center justify-between hover:border-slate-700 transition-colors">
            <div>
                <p className="text-sm font-medium" style={{ color: COLORS.text }}>{title}</p>
                <p className="text-3xl font-bold text-white mt-1">{value}</p>
            </div>
            <div className="p-3 rounded-full bg-slate-800" style={{ color: color }}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
};

export default AdminDashboard;
