import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, LogOut, User } from 'lucide-react';
import { logout } from '../store/authSlice';
import Button from './ui/Button';

const Navbar = () => {
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
        <nav className="bg-primary-dark text-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2">
                        <img src="/logo.jpg" alt="Link2Act" className="h-8 w-auto rounded" />
                        Link2Act
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {role === 'CITOYEN' && (
                                    <>
                                        <Link to="/citizen/dashboard" className="hover:text-accent transition">Tableau de bord</Link>
                                        <Link to="/citizen/declare" className="hover:text-accent transition">Nouvelle demande</Link>
                                    </>
                                )}
                                {role === 'BENEVOLE' && (
                                    <Link to="/volunteer/map" className="hover:text-accent transition">Carte des besoins</Link>
                                )}
                                {role === 'ADMIN' && (
                                    <>
                                        <Link to="/admin/dashboard" className="hover:text-accent transition">Tableau de bord</Link>
                                        <Link to="/admin/cases" className="hover:text-accent transition">Gestion des Demandes</Link>
                                        <Link to="/admin/users" className="hover:text-accent transition">Utilisateurs</Link>
                                        <Link to="/admin/verification" className="hover:text-accent transition">Vérification</Link>
                                    </>
                                )}

                                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                                    <Link to="/profile" className="flex items-center gap-2 hover:text-accent transition">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm">{user?.firstName}</span>
                                    </Link>
                                    <button onClick={handleLogout} className="text-gray-300 hover:text-white transition">
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-x-4">
                                <Link to="/login" className="hover:text-accent transition">Se connecter</Link>
                                <Link to="/register">
                                    <Button variant="accent" size="sm">S'inscrire</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-primary-dark border-t border-white/10 p-4 space-y-4">
                    {isAuthenticated ? (
                        <>
                            {role === 'CITOYEN' && (
                                <>
                                    <Link to="/citizen/dashboard" className="block hover:text-accent">Tableau de bord</Link>
                                    <Link to="/citizen/declare" className="block hover:text-accent">Nouvelle demande</Link>
                                </>
                            )}
                            {role === 'BENEVOLE' && (
                                <Link to="/volunteer/map" className="block hover:text-accent">Carte des besoins</Link>
                            )}
                            {role === 'ADMIN' && (
                                <>
                                    <Link to="/admin/dashboard" className="block hover:text-accent">Tableau de bord</Link>
                                    <Link to="/admin/cases" className="block hover:text-accent">Gestion des Demandes</Link>
                                    <Link to="/admin/verification" className="block hover:text-accent">Vérification</Link>
                                </>
                            )}
                            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-300 hover:text-white w-full pt-4 border-t border-white/10">
                                <LogOut className="w-5 h-5" /> Se déconnecter
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <Link to="/login" className="block hover:text-accent">Se connecter</Link>
                            <Link to="/register" className="block hover:text-accent">S'inscrire</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
