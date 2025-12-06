import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { loginSuccess } from '../../store/authSlice';
import authService from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ThemeToggle from '../../components/common/ThemeToggle';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

const Login = () => {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState(null);

    // Redirection automatique si déjà connecté
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (token && role) {
            // Redirection intelligente selon le rôle
            if (role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (role === 'BENEVOLE') {
                navigate('/volunteer/map');
            } else if (role === 'CITOYEN') {
                navigate('/citizen/dashboard');
            }
        }
    }, [navigate]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        setLoginError(null);

        // Clear any existing tokens to prevent 403s from stale auth headers
        localStorage.removeItem('token');
        localStorage.removeItem('role');

        try {
            const response = await authService.login(data);

            console.log('Server response:', response); // Debug log

            const { token, role } = response;

            if (!token || !role) {
                throw new Error('Réponse invalide du serveur (token ou rôle manquant)');
            }

            dispatch(loginSuccess({ token, role }));

            // Redirect based on role
            if (role === 'CITOYEN') {
                navigate('/citizen/dashboard');
            } else if (role === 'BENEVOLE') {
                navigate('/volunteer/map');
            } else if (role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                console.warn('Rôle inconnu:', role);
                navigate('/'); // Fallback
            }
        } catch (error) {
            console.error('Login failed', error);
            if (error.response && error.response.status === 403) {
                setLoginError(t('auth.errors.accessDenied'));
            } else {
                setLoginError(t('auth.errors.invalidCredentials'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 transition-colors duration-300">
            {/* Background Pattern */}
            <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50 pointer-events-none" />
            
            {/* Theme & Language Toggle */}
            <div className="fixed top-4 right-4 rtl:right-auto rtl:left-4 z-50 flex items-center gap-2">
                <LanguageSwitcher variant="icon" />
                <ThemeToggle variant="icon" />
            </div>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700/50 w-full max-w-md"
            >
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-transparent to-violet-500/10 pointer-events-none" />
                
                <div className="relative">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="inline-flex items-center justify-center mb-4"
                        >
                            <Link to="/" className="relative group cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
                                <div className="relative bg-gradient-to-r from-cyan-500 to-violet-500 p-1 rounded-2xl">
                                    <img 
                                        src="/logo.jpg" 
                                        alt="Logo" 
                                        className="w-16 h-16 object-contain rounded-xl bg-white"
                                    />
                                </div>
                            </Link>
                        </motion.div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent mb-2">{t('auth.login.title')}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{t('auth.login.subtitle')}</p>
                    </div>

                    {loginError && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm border border-red-200 dark:border-red-500/30"
                        >
                            {loginError}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('auth.login.email')}</label>
                            <Input
                                type="email"
                                placeholder={t('auth.login.emailPlaceholder')}
                                {...register('email', {
                                    required: t('auth.errors.emailRequired'),
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: t('auth.errors.emailInvalid')
                                    }
                                })}
                                error={errors.email}
                                className="dark:bg-slate-900/50 dark:border-slate-600/50 dark:text-white dark:placeholder-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('auth.login.password')}</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...register('password', { required: t('auth.errors.passwordRequired') })}
                                    error={errors.password}
                                    className="pr-12 rtl:pr-4 rtl:pl-12 dark:bg-slate-900/50 dark:border-slate-600/50 dark:text-white dark:placeholder-gray-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300" 
                            isLoading={isLoading}
                        >
                            <Sparkles className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                            {t('auth.login.submit')}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        {t('auth.login.noAccount')}{' '}
                        <Link to="/register" className="text-cyan-600 dark:text-cyan-400 font-medium hover:underline">
                            {t('auth.login.signUp')}
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
