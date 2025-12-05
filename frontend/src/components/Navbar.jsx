import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Menu, X, LogOut, User } from 'lucide-react';
import { logout } from '../store/authSlice';
import Button from './ui/Button';
import ThemeToggle from './common/ThemeToggle';
import LanguageSwitcher from './common/LanguageSwitcher';

const Navbar = () => {
    const { t } = useTranslation();
    const { isAuthenticated, user, role } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') {
        return null; // Don't show navbar on auth pages or landing page (landing has its own header)
    }

    return (
        <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 shrink-0">
                        <img src="/logo.jpg" alt="Link2Act" className="h-8 w-auto rounded" />
                        <span className="bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent">Link2Act</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        {isAuthenticated ? (
                            <>
                                {role === 'CITOYEN' && (
                                    <>
                                        <Link to="/citizen/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 font-medium transition-colors whitespace-nowrap">
                                            {t('navbar.dashboard')}
                                        </Link>
                                        <Link to="/citizen/declare" className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 font-medium transition-colors whitespace-nowrap">
                                            {t('navbar.newRequest')}
                                        </Link>
                                    </>
                                )}
                                {role === 'BENEVOLE' && (
                                    <>
                                        <Link to="/volunteer/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 font-medium transition-colors whitespace-nowrap">
                                            {t('navbar.dashboard')}
                                        </Link>
                                        <Link to="/volunteer/map" className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 font-medium transition-colors whitespace-nowrap">
                                            {t('navbar.map')}
                                        </Link>
                                        <Link to="/volunteer/missions" className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 font-medium transition-colors whitespace-nowrap">
                                            {t('navbar.myInterventions')}
                                        </Link>
                                    </>
                                )}
                                {role === 'ADMIN' && (
                                    <>
                                        <Link to="/admin/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 font-medium transition-colors whitespace-nowrap">
                                            {t('navbar.dashboard')}
                                        </Link>
                                        <Link to="/admin/cases" className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 font-medium transition-colors whitespace-nowrap">
                                            {t('dashboard.admin.requests')}
                                        </Link>
                                        <Link to="/admin/users" className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 font-medium transition-colors whitespace-nowrap">
                                            {t('dashboard.admin.users')}
                                        </Link>
                                        <Link to="/admin/verification" className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 font-medium transition-colors whitespace-nowrap">
                                            {t('dashboard.admin.validation.title')}
                                        </Link>
                                    </>
                                )}

                                <div className="flex items-center gap-3 ltr:ml-4 ltr:pl-4 rtl:mr-4 rtl:pr-4 ltr:border-l rtl:border-r border-gray-200 dark:border-slate-700">
                                    {/* Language Switcher */}
                                    <LanguageSwitcher variant="dropdown" />
                                    
                                    {/* Theme Toggle */}
                                    <ThemeToggle variant="dropdown" />

                                    {/* Profile */}
                                    <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                                            {user?.firstName?.charAt(0) || 'U'}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.firstName}</span>
                                    </Link>

                                    {/* Logout */}
                                    <button 
                                        onClick={handleLogout} 
                                        className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                        title={t('navbar.logout')}
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <LanguageSwitcher variant="dropdown" />
                                <ThemeToggle variant="icon" />
                                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 font-medium transition-colors">
                                    {t('navbar.login')}
                                </Link>
                                <Link to="/register">
                                    <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-5 py-2 rounded-xl font-medium shadow-lg shadow-cyan-500/25">
                                        {t('auth.register.submit')}
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-3">
                        <LanguageSwitcher variant="icon" />
                        <ThemeToggle variant="icon" />
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 p-4 space-y-3">
                    {isAuthenticated ? (
                        <>
                            {role === 'CITOYEN' && (
                                <>
                                    <Link to="/citizen/dashboard" className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                        {t('navbar.dashboard')}
                                    </Link>
                                    <Link to="/citizen/declare" className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                        {t('navbar.newRequest')}
                                    </Link>
                                </>
                            )}
                            {role === 'BENEVOLE' && (
                                <>
                                    <Link to="/volunteer/dashboard" className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                        {t('navbar.dashboard')}
                                    </Link>
                                    <Link to="/volunteer/map" className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                        {t('navbar.map')}
                                    </Link>
                                    <Link to="/volunteer/missions" className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                        {t('navbar.myInterventions')}
                                    </Link>
                                </>
                            )}
                            {role === 'ADMIN' && (
                                <>
                                    <Link to="/admin/dashboard" className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                        {t('navbar.dashboard')}
                                    </Link>
                                    <Link to="/admin/cases" className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                        {t('dashboard.admin.requests')}
                                    </Link>
                                    <Link to="/admin/verification" className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                        {t('dashboard.admin.validation.title')}
                                    </Link>
                                </>
                            )}
                            <div className="pt-3 mt-3 border-t border-gray-200 dark:border-slate-800">
                                <Link to="/profile" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                                        {user?.firstName?.charAt(0) || 'U'}
                                    </div>
                                    <span>{t('navbar.profile')}</span>
                                </Link>
                                <button 
                                    onClick={handleLogout} 
                                    className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-2"
                                >
                                    <LogOut className="w-5 h-5" /> 
                                    {t('navbar.logout')}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <Link to="/login" className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                {t('navbar.login')}
                            </Link>
                            <Link to="/register" className="block px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-center font-medium">
                                {t('auth.register.submit')}
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
