import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Map, User, CheckCircle, Menu, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import authService from '../services/authService';
import ThemeToggle from './common/ThemeToggle';
import LanguageSwitcher from './common/LanguageSwitcher';

const VolunteerNavBar = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isRTL = i18n.language === 'ar';

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/volunteer/map', label: t('navbar.map'), icon: Map },
        { path: '/volunteer/missions', label: t('navbar.myInterventions'), icon: CheckCircle },
        { path: '/profile', label: t('navbar.profile'), icon: User },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 shadow-sm transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                            <div className="relative bg-gradient-to-r from-violet-500 to-cyan-500 p-2 rounded-xl">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                                SolidarLink
                            </span>
                            <span className="hidden sm:inline-flex px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full shadow-lg shadow-violet-500/25">
                                {t('navbar.volunteer')}
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    isActive(link.path)
                                        ? 'bg-gradient-to-r from-violet-500/10 to-cyan-500/10 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-500/30'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <link.icon className="w-4 h-4" />
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        {/* Language Switcher - Desktop */}
                        <div className="hidden md:block">
                            <LanguageSwitcher variant="icon" />
                        </div>

                        {/* Theme Toggle - Desktop */}
                        <div className="hidden md:block">
                            <ThemeToggle variant="icon" />
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>{t('navbar.logout')}</span>
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-gray-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                        isActive(link.path)
                                            ? 'bg-gradient-to-r from-violet-500/10 to-cyan-500/10 text-violet-600 dark:text-violet-400'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <link.icon className="w-5 h-5" />
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                            
                            {/* Theme Toggle - Mobile */}
                            <div className="flex items-center justify-between px-4 py-3 text-gray-600 dark:text-gray-300">
                                <span className="text-sm font-medium">{isRTL ? 'السمة' : 'Thème'}</span>
                                <ThemeToggle variant="icon" />
                            </div>

                            {/* Language Switcher - Mobile */}
                            <div className="flex items-center justify-between px-4 py-3 text-gray-600 dark:text-gray-300">
                                <span className="text-sm font-medium">{t('language.select')}</span>
                                <LanguageSwitcher variant="icon" />
                            </div>
                            
                            <button
                                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>{t('navbar.logout')}</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default VolunteerNavBar;
