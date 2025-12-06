import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, MapPin, ArrowRight, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSwitcher from '../common/LanguageSwitcher';

const HeroSection = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [searchQuery, setSearchQuery] = useState("");

    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const isAuthenticated = !!token && !!role;

    // Déterminer la route du dashboard selon le rôle
    const getDashboardRoute = () => {
        if (role === 'ADMIN') return '/admin/dashboard';
        if (role === 'BENEVOLE') return '/volunteer/map';
        if (role === 'CITOYEN') return '/citizen/dashboard';
        return '/';
    };

    return (
        <header className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-cyan-50/30 to-purple-50/30 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
            {/* Floating Navbar */}
            <nav className="absolute top-0 left-0 right-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                                <Heart className="w-5 h-5 text-white fill-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                Solidar<span className="text-cyan-600 dark:text-cyan-400">Link</span>
                            </span>
                        </Link>

                        {/* Right Controls */}
                        <div className="flex items-center gap-3">
                            {/* Language Switcher */}
                            <LanguageSwitcher variant="minimal" />
                            
                            {/* Theme Toggle */}
                            <ThemeToggle variant="minimal" />

                            {/* Conditional Auth/Dashboard Buttons */}
                            {isAuthenticated ? (
                                // Afficher le bouton "Mon Tableau de Bord" pour les utilisateurs connectés
                                <div className="hidden sm:flex items-center gap-2 ml-4 rtl:mr-4 rtl:ml-0">
                                    <Link
                                        to={getDashboardRoute()}
                                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-full transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        {t('navbar.myDashboard', 'Mon Tableau de Bord')}
                                    </Link>
                                </div>
                            ) : (
                                // Afficher les boutons Connexion/Inscription pour les visiteurs
                                <div className="hidden sm:flex items-center gap-2 ml-4 rtl:mr-4 rtl:ml-0">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                                    >
                                        {t('navbar.login', 'Connexion')}
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-white rounded-full transition-colors shadow-lg shadow-cyan-500/25"
                                    >
                                        {t('auth.register.title', 'S\'inscrire')}
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Auth/Dashboard Icons */}
                            {isAuthenticated ? (
                                <div className="flex sm:hidden items-center gap-2 ml-2">
                                    <Link
                                        to={getDashboardRoute()}
                                        className="p-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full transition-colors shadow-lg shadow-cyan-500/25"
                                        title={t('navbar.myDashboard', 'Mon Tableau de Bord')}
                                    >
                                        <LayoutDashboard className="w-5 h-5" />
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex sm:hidden items-center gap-2 ml-2">
                                    <Link
                                        to="/login"
                                        className="p-2 text-white/80 hover:text-white transition-colors"
                                    >
                                        <LogIn className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="p-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full transition-colors"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                    alt="Background"
                    className="w-full h-full object-cover grayscale opacity-10 dark:brightness-[0.3] dark:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/30 to-gray-50 dark:from-black/90 dark:via-black/70 dark:to-slate-900 dark:dark:to-slate-950"></div>

                {/* Cercles décoratifs (Light Mode plus vibrant) */}
                <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-100/40 dark:bg-cyan-900/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-100/40 dark:bg-purple-900/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
                
                {/* Grille subtile (Light Mode uniquement) */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d440_1px,transparent_1px),linear-gradient(to_bottom,#06b6d440_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:opacity-0 opacity-30"></div>
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
                        className="inline-block mb-4 px-6 py-2 rounded-full border-2 border-cyan-500 dark:border-cyan-400 bg-white/80 dark:bg-transparent backdrop-blur-sm text-cyan-700 dark:text-cyan-400 text-sm font-semibold tracking-wider uppercase shadow-lg shadow-cyan-500/20 dark:shadow-cyan-500/50"
                    >
                        {t('hero.badge')}
                    </motion.div>
                    <motion.h1
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
                        className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-tight tracking-tight"
                    >
                        {t('hero.title.line1')} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 animate-gradient-x drop-shadow-[0_2px_10px_rgba(6,182,212,0.3)] dark:drop-shadow-none">
                            {t('hero.title.line2')}
                        </span>
                    </motion.h1>
                    <motion.p
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
                        className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed font-light"
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
                        <div className="relative flex items-center bg-white/90 dark:bg-gray-800/50 backdrop-blur-md border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-2 shadow-2xl shadow-gray-300/50 dark:shadow-gray-900/50 hover:shadow-cyan-300/30 dark:hover:shadow-cyan-500/30 transition-all duration-300 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
                            <MapPin className="ml-4 rtl:ml-0 rtl:mr-4 text-gray-400 dark:text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder={t('hero.searchPlaceholder')}
                                className="w-full bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-0 px-4 py-3 text-lg outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="bg-gradient-to-r from-cyan-500 to-cyan-600 dark:from-cyan-400 dark:to-cyan-500 hover:from-cyan-600 hover:to-cyan-700 dark:hover:from-cyan-500 dark:hover:to-cyan-600 text-white p-3 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/30">
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
                        <button className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 hover:from-cyan-600 hover:via-cyan-700 hover:to-blue-700 dark:hover:from-cyan-500 dark:hover:via-blue-600 dark:hover:to-purple-600 text-white text-lg font-bold rounded-2xl shadow-2xl shadow-cyan-500/40 dark:shadow-cyan-500/50 hover:shadow-cyan-500/60 dark:hover:shadow-cyan-500/70 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto overflow-hidden">
                            {/* Effet de brillance */}
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                            
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {t('hero.ctaButton')} <Heart className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                            </span>
                        </button>
                    </Link>
                    <Link to="/register" className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold text-lg rounded-2xl border-2 border-gray-300 dark:border-gray-600 shadow-xl shadow-gray-300/30 dark:shadow-gray-900/30 transform hover:scale-105 transition-all duration-300 flex items-center gap-2 group">
                        {t('hero.howItWorks')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </header>
    );
};

export default HeroSection;
