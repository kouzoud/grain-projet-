import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Shield, User, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import adminService from '../../services/adminService';

const UserManagement = () => {
    const { t, i18n } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const isRTL = i18n.language === 'ar';

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
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/50">{t('navbar.admin')}</span>;
            case 'BENEVOLE':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/50">{t('navbar.volunteer')}</span>;
            case 'CITOYEN':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/50">{t('navbar.citizen')}</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/50">{role}</span>;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ACTIF':
                return <span className="flex items-center gap-1 text-green-400 text-xs font-bold"><CheckCircle className="w-3 h-3" /> {t('dashboard.admin.userManagement.active')}</span>;
            case 'BANNI':
                return <span className="flex items-center gap-1 text-red-400 text-xs font-bold"><XCircle className="w-3 h-3" /> {isRTL ? 'محظور' : 'BANNI'}</span>;
            case 'EN_ATTENTE_VALIDATION':
                return <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold"><Clock className="w-3 h-3" /> {t('status.EN_ATTENTE')}</span>;
            default:
                return <span className="text-gray-400 text-xs">{status}</span>;
        }
    };

    return (
        <div className={`p-6 space-y-6 min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="text-cyan-500" /> {t('dashboard.admin.userManagement.title')}
                </h1>
                <div className="relative">
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5`} />
                    <input
                        type="text"
                        placeholder={t('dashboard.admin.userManagement.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none w-64 transition-all`}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                                <th className={`p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'المستخدم' : 'Utilisateur'}</th>
                                <th className={`p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t('dashboard.admin.userManagement.role')}</th>
                                <th className={`p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t('dashboard.admin.userManagement.status')}</th>
                                <th className={`p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'تاريخ التسجيل' : 'Date Inscription'}</th>
                                <th className={`p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-left' : 'text-right'}`}>{t('dashboard.admin.userManagement.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400 dark:text-gray-500">{t('common.loading')}</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400 dark:text-gray-500">{t('dashboard.admin.userManagement.noUsers')}</td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white font-bold">
                                                    {user.prenom[0]}{user.nom[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{user.prenom} {user.nom}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(user.statutCompte)}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                            {user.dateInscription ? new Date(user.dateInscription).toLocaleDateString(isRTL ? 'ar-MA' : 'fr-FR') : '-'}
                                        </td>
                                        <td className={`p-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                                            {user.role !== 'ADMIN' && (
                                                <button
                                                    onClick={() => handleToggleBan(user.id)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${user.statutCompte === 'BANNI'
                                                            ? 'border-green-500/50 text-green-600 dark:text-green-400 hover:bg-green-500/10'
                                                            : 'border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-500/10'
                                                        }`}
                                                >
                                                    {user.statutCompte === 'BANNI' ? (isRTL ? 'تفعيل' : 'Activer') : (isRTL ? 'حظر' : 'Bannir')}
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
