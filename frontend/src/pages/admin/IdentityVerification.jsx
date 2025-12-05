import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { CheckCircle, XCircle, User, FileText, ZoomIn } from 'lucide-react';

const IdentityVerification = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageZoom, setImageZoom] = useState(false);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            const data = await adminService.getPendingUsers();
            setUsers(data);
            if (data.length > 0) {
                setSelectedUser(data[0]);
            } else {
                setSelectedUser(null);
            }
        } catch (error) {
            console.error("Error fetching pending users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async (userId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir valider cet utilisateur ?")) return;
        try {
            await adminService.validateUser(userId);
            removeUserFromList(userId);
        } catch (error) {
            console.error("Error validating user:", error);
            alert("Erreur lors de la validation");
        }
    };

    const handleReject = async (userId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir rejeter cet utilisateur ?")) return;
        try {
            await adminService.rejectUser(userId);
            removeUserFromList(userId);
        } catch (error) {
            console.error("Error rejecting user:", error);
            alert("Erreur lors du rejet");
        }
    };

    const removeUserFromList = (userId) => {
        const updatedUsers = users.filter(u => u.id !== userId);
        setUsers(updatedUsers);
        if (selectedUser && selectedUser.id === userId) {
            setSelectedUser(updatedUsers.length > 0 ? updatedUsers[0] : null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900 text-cyan-400">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-900 text-gray-100 overflow-hidden font-sans">
            {/* Left Sidebar: User List */}
            <div className="w-1/3 border-r border-gray-800 bg-gray-900/95 flex flex-col">
                <div className="p-6 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-2">
                        <User className="w-5 h-5" />
                        En Attente ({users.length})
                    </h2>
                </div>
                <div className="overflow-y-auto flex-1 p-4 space-y-3 custom-scrollbar">
                    {users.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 italic">
                            Aucun utilisateur en attente.
                        </div>
                    ) : (
                        users.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 border ${selectedUser?.id === user.id
                                    ? 'bg-gray-800 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                                    : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className={`font-semibold text-lg ${selectedUser?.id === user.id ? 'text-cyan-300' : 'text-gray-200'}`}>
                                            {user.nom} {user.prenom}
                                        </h3>
                                        <p className="text-sm text-gray-400">{user.email}</p>
                                    </div>
                                    <span className="px-2 py-1 text-xs font-medium rounded bg-gray-700 text-gray-300 border border-gray-600">
                                        {user.role}
                                    </span>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    Inscrit le: {new Date(user.dateInscription).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Area: Detail View */}
            <div className="flex-1 flex flex-col bg-gray-900 relative">
                {selectedUser ? (
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-800 bg-gray-900/95 flex justify-between items-center shadow-lg z-10">
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">
                                    {selectedUser.nom} {selectedUser.prenom}
                                </h1>
                                <p className="text-cyan-400 mt-1 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                                    Vérification d'identité requise
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleReject(selectedUser.id)}
                                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300 font-medium"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Rejeter
                                </button>
                                <button
                                    onClick={() => handleValidate(selectedUser.id)}
                                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500/10 text-green-400 border border-green-500/50 hover:bg-green-500/20 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-300 font-medium"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Valider l'Identité
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                                {/* User Info */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 backdrop-blur-sm">
                                        <h3 className="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-700 pb-2">Informations Personnelles</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
                                                <p className="text-gray-200 font-medium break-all">{selectedUser.email}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase tracking-wider">Téléphone</label>
                                                <p className="text-gray-200 font-medium">{selectedUser.telephone || "Non renseigné"}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase tracking-wider">Rôle</label>
                                                <p className="text-gray-200 font-medium">{selectedUser.role}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase tracking-wider">Date d'inscription</label>
                                                <p className="text-gray-200 font-medium">{new Date(selectedUser.dateInscription).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Document Viewer */}
                                <div className="lg:col-span-2 flex flex-col h-full min-h-[500px]">
                                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 backdrop-blur-sm flex-1 flex flex-col">
                                        <h3 className="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-700 pb-2 flex justify-between items-center">
                                            <span className="flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-cyan-400" />
                                                Document Officiel
                                            </span>
                                            {selectedUser.documentType && (
                                                <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-400">{selectedUser.documentType}</span>
                                            )}
                                        </h3>

                                        <div className="flex-1 bg-gray-900/80 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center relative overflow-hidden group">
                                            {selectedUser.documentUrl ? (
                                                <>
                                                    <img
                                                        src={selectedUser.documentUrl.startsWith('/')
                                                            ? `http://localhost:8080${selectedUser.documentUrl}`
                                                            : `http://localhost:8080/api/uploads/${selectedUser.documentUrl}`
                                                        }
                                                        alt="Document Officiel"
                                                        className="max-w-full max-h-full object-contain transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                        <button
                                                            onClick={() => setImageZoom(true)}
                                                            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors flex items-center gap-2 shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300"
                                                        >
                                                            <ZoomIn className="w-5 h-5" />
                                                            Agrandir
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center text-gray-500">
                                                    <FileText className="w-16 h-16 mx-auto mb-2 opacity-20" />
                                                    <p>Aucun document disponible</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <User className="w-24 h-24 mb-4 opacity-10 text-cyan-500" />
                        <p className="text-xl font-light">Sélectionnez un utilisateur pour commencer la vérification</p>
                    </div>
                )}
            </div>

            {/* Image Zoom Modal */}
            {imageZoom && selectedUser && selectedUser.documentUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setImageZoom(false)}>
                    <div className="relative max-w-7xl max-h-full">
                        <img
                            src={selectedUser.documentUrl.startsWith('/')
                                ? `http://localhost:8080${selectedUser.documentUrl}`
                                : `http://localhost:8080/api/uploads/${selectedUser.documentUrl}`
                            }
                            alt="Document Fullscreen"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-gray-700"
                        />
                        <button
                            onClick={() => setImageZoom(false)}
                            className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors"
                        >
                            <XCircle className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IdentityVerification;
