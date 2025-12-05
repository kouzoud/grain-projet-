import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <header className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-black">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                    alt="Background"
                    className="w-full h-full object-cover grayscale brightness-[0.3]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-slate-900"></div>

                {/* Aurora Effects */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.2,
                                delayChildren: 0.3
                            }
                        }
                    }}
                >
                    <motion.div
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
                        className="inline-block mb-4 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm text-cyan-400 text-sm font-medium tracking-wide uppercase"
                    >
                        {t('hero.badge')}
                    </motion.div>
                    <motion.h1
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
                        className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight"
                    >
                        {t('hero.title.line1')} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x">
                            {t('hero.title.line2')}
                        </span>
                    </motion.h1>
                    <motion.p
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
                        className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed font-light"
                    >
                        {t('hero.subtitle')}
                    </motion.p>
                </motion.div>

                {/* Smart Search Bar */}
                <motion.div
                    className="max-w-2xl mx-auto mb-12 relative z-20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-full p-2 shadow-2xl">
                            <MapPin className="ml-4 rtl:ml-0 rtl:mr-4 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder={t('hero.searchPlaceholder')}
                                className="w-full bg-transparent border-none text-white placeholder-slate-400 focus:ring-0 px-4 py-3 text-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="bg-cyan-500 hover:bg-cyan-400 text-white p-3 rounded-full transition-colors shadow-lg shadow-cyan-500/20">
                                <Search className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <Link to="/register">
                        <button className="group relative px-8 py-4 bg-white text-slate-900 text-lg font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 w-full sm:w-auto overflow-hidden">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {t('hero.ctaButton')} <Heart className="w-5 h-5 text-red-500 fill-current group-hover:scale-110 transition-transform" />
                            </span>
                        </button>
                    </Link>
                    <Link to="/register" className="text-slate-300 hover:text-white font-medium flex items-center gap-2 transition-colors group">
                        {t('hero.howItWorks')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </header>
    );
};

export default HeroSection;
