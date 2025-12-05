import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import RequestCard from '../RequestCard';
import { ArrowRight } from 'lucide-react';

const LatestMissions = ({ successStories }) => {
    const { t } = useTranslation();
    
    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="text-cyan-500 font-bold tracking-wider uppercase mb-2 text-sm">{t('landing.missions.badge')}</div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">{t('landing.missions.title')}</h2>
                    </motion.div>
                    <Link to="/register" className="group flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                        {t('landing.missions.viewAll')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000">
                    {successStories.length > 0 ? (
                        successStories.map((story, index) => (
                            <motion.div
                                key={story.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: index * 0.15 }}
                                whileHover={{ scale: 1.03, rotateY: 2, zIndex: 10 }}
                                className="transform transition-all duration-500"
                            >
                                <div className="h-full bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all group">
                                    <RequestCard request={story} />
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        // Skeleton Loading State
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-[400px] bg-slate-900/30 rounded-2xl border border-slate-800 animate-pulse flex flex-col p-4">
                                <div className="w-full h-48 bg-slate-800 rounded-xl mb-4"></div>
                                <div className="h-6 bg-slate-800 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default LatestMissions;
