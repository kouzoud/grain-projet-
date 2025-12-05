import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckCircle, MapPin, TrendingUp, ArrowUpRight } from 'lucide-react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import publicService from '../../services/publicService';

const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-slate-800 rounded-md ${className}`}></div>
);

const BentoCard = ({ title, value, icon, subtext, delay, loading, colSpan = "col-span-1" }) => (
    <motion.div
        className={`${colSpan} relative overflow-hidden p-8 rounded-3xl bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-cyan-500/30 transition-all duration-500 group`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: delay }}
    >
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="text-cyan-500 w-6 h-6" />
        </div>

        <div className="flex items-start justify-between mb-8">
            <div className="p-3 bg-slate-800/50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            {loading ? (
                <Skeleton className="w-24 h-6 rounded-full" />
            ) : subtext && (
                <div className="flex items-center gap-1 text-green-400 text-sm font-medium bg-green-400/10 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" /> {subtext}
                </div>
            )}
        </div>

        <div>
            <div className="text-5xl font-bold text-white mb-2 tracking-tight">
                {loading ? (
                    <Skeleton className="w-32 h-12 mb-2" />
                ) : (
                    <CountUp end={value} duration={2.5} separator=" " enableScrollSpy />
                )}
            </div>
            <div className="text-slate-400 font-medium text-lg">{title}</div>
        </div>

        {/* Decorative Gradient Blob */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-colors"></div>
    </motion.div>
);

const ImpactSection = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        activeVolunteers: 0,
        volunteerGrowth: 0,
        coveredCities: 0,
        completedMissions: 0,
        successRate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await publicService.getImpactStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch impact stats", error);
            } finally {
                // Simulate a small delay to show off the skeleton if response is too fast
                setTimeout(() => setLoading(false), 500);
            }
        };

        fetchStats();
    }, []);

    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{t('landing.impact.title')}</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        {t('landing.impact.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {/* Large Card - Volunteers */}
                    <BentoCard
                        title={t('landing.stats.volunteers')}
                        value={stats.activeVolunteers}
                        icon={<Users className="w-8 h-8 text-cyan-400" />}
                        subtext={stats.volunteerGrowth > 0 ? `+${stats.volunteerGrowth}% ${t('landing.impact.thisMonth')}` : null}
                        delay={0}
                        loading={loading}
                        colSpan="md:col-span-2"
                    />

                    {/* Standard Card - Cities */}
                    <BentoCard
                        title={t('landing.stats.cities')}
                        value={stats.coveredCities}
                        icon={<MapPin className="w-8 h-8 text-purple-400" />}
                        delay={0.2}
                        loading={loading}
                    />

                    {/* Standard Card - Missions */}
                    <BentoCard
                        title={t('landing.stats.missions')}
                        value={stats.completedMissions}
                        icon={<CheckCircle className="w-8 h-8 text-green-400" />}
                        subtext={`${stats.successRate}% ${t('landing.impact.successRate')}`}
                        delay={0.4}
                        loading={loading}
                    />

                    {/* Wide Card - CTA */}
                    <motion.div
                        className="md:col-span-2 relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-500 group flex items-center justify-between"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <div>
                            <div className="text-2xl font-bold text-white mb-2">{t('landing.cta.title')}</div>
                            <p className="text-slate-400">{t('landing.cta.subtitle')}</p>
                        </div>
                        <Link to="/register" className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full font-bold transition-colors shadow-lg shadow-cyan-500/20">
                            {t('landing.cta.button')}
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ImpactSection;
