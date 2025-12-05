import React, { useState, useEffect } from 'react';
import { Search, Shield, User, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import adminService from '../../services/adminService';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBan = async (userId) => {
        try {
            await adminService.toggleUserBan(userId);
            // Optimistic update or refetch
            setUsers(users.map(u =>
                u.id === userId
                    ? { ...u, statutCompte: u.statutCompte === 'BANNI' ? 'ACTIF' : 'BANNI' }
                    : u
            ));
        } catch (error) {
            console.error("Failed to toggle ban", error);
            alert("Erreur lors de la modification du statut.");
        }
    };

    const filteredUsers = users.filter(user =>
        user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role) => {
        switch (role) {
            case 'ADMIN':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/50">ADMIN</span>;
            case 'BENEVOLE':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/50">BÉNÉVOLE</span>;
            case 'CITOYEN':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/50">CITOYEN</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/50">{role}</span>;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ACTIF':
                return <span className="flex items-center gap-1 text-green-400 text-xs font-bold"><CheckCircle className="w-3 h-3" /> ACTIF</span>;
            case 'BANNI':
                return <span className="flex items-center gap-1 text-red-400 text-xs font-bold"><XCircle className="w-3 h-3" /> BANNI</span>;
            case 'EN_ATTENTE_VALIDATION':
                return <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold"><Clock className="w-3 h-3" /> EN ATTENTE</span>;
            default:
                return <span className="text-gray-400 text-xs">{status}</span>;
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <User className="text-primary" /> Gestion des Utilisateurs
                </h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-surface border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-64 transition-all"
                    />
                </div>
            </div>

            <div className="bg-surface border border-gray-700 rounded-xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/20 border-b border-gray-700">
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Utilisateur</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Rôle</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date Inscription</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">Chargement...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">Aucun utilisateur trouvé.</td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                                                    {user.prenom[0]}{user.nom[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{user.prenom} {user.nom}</p>
                                                    <p className="text-xs text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(user.statutCompte)}
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">
                                            {user.dateInscription ? new Date(user.dateInscription).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="p-4 text-right">
                                            {user.role !== 'ADMIN' && (
                                                <button
                                                    onClick={() => handleToggleBan(user.id)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${user.statutCompte === 'BANNI'
                                                            ? 'border-green-500/50 text-green-400 hover:bg-green-500/10'
                                                            : 'border-red-500/50 text-red-400 hover:bg-red-500/10'
                                                        }`}
                                                >
                                                    {user.statutCompte === 'BANNI' ? 'Activer' : 'Bannir'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
