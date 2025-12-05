import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginSuccess } from '../../store/authSlice';
import authService from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState(null);

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
                setLoginError('Accès refusé. Vérifiez vos identifiants ou si votre compte est validé.');
            } else {
                setLoginError('Identifiants incorrects. Veuillez réessayer.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-page p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">Connexion</h1>
                    <p className="text-secondary">Bienvenue sur Link2Act</p>
                </div>

                {loginError && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm">
                        {loginError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Email</label>
                        <Input
                            type="email"
                            placeholder="votre@email.com"
                            {...register('email', {
                                required: 'L\'email est requis',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Adresse email invalide'
                                }
                            })}
                            error={errors.email}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Mot de passe</label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...register('password', { required: 'Le mot de passe est requis' })}
                                error={errors.password}
                                className="pr-10" // Add padding for the icon
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Se connecter
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-secondary">
                    Pas encore de compte ?{' '}
                    <Link to="/register" className="text-accent font-medium hover:underline">
                        S'inscrire
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
