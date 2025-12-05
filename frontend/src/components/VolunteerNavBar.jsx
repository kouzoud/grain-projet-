import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Map, User, CheckCircle } from 'lucide-react';
import authService from '../services/authService';

const VolunteerNavBar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <nav className="bg-primary-dark text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2">
                            Link2Act <span className="text-xs bg-secondary px-2 py-1 rounded-full text-white">Bénévole</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">

                        <Link to="/volunteer/map" className="flex items-center gap-2 hover:text-secondary transition-colors">
                            <Map className="w-5 h-5" />
                            <span>Carte</span>
                        </Link>
                        <Link to="/volunteer/missions" className="flex items-center gap-2 hover:text-secondary transition-colors">
                            <CheckCircle className="w-5 h-5" />
                            <span>Mes Missions</span>
                        </Link>
                        <Link to="/profile" className="flex items-center gap-2 hover:text-secondary transition-colors">
                            <User className="w-5 h-5" />
                            <span>Mon Profil</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default VolunteerNavBar;
