import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((messageOrObject, type = 'info', duration = 4000) => {
        const id = Date.now();
        
        // Gérer le cas où un objet est passé (depuis useNotifications)
        let message, toastType;
        if (typeof messageOrObject === 'object' && messageOrObject !== null && messageOrObject.message) {
            message = messageOrObject.message;
            toastType = messageOrObject.type || 'info';
        } else {
            message = messageOrObject;
            toastType = type;
        }
        
        setToasts((prev) => [...prev, { id, message, type: toastType }]);

        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const toastStyles = {
        success: 'bg-gradient-to-r from-green-500 to-green-600 border-green-400',
        error: 'bg-gradient-to-r from-red-500 to-red-600 border-red-400',
        warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400',
        info: 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400'
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] space-y-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-center p-4 rounded-xl shadow-2xl text-white min-w-[320px] max-w-md animate-in slide-in-from-right duration-300 border-2 backdrop-blur-sm pointer-events-auto ${toastStyles[toast.type] || toastStyles.info}`}
                        role="alert"
                        aria-live="polite"
                    >
                        <div className="mr-3 flex-shrink-0">
                            {toast.type === 'success' && <CheckCircle className="w-6 h-6" />}
                            {toast.type === 'error' && <AlertCircle className="w-6 h-6" />}
                            {toast.type === 'warning' && <AlertCircle className="w-6 h-6" />}
                            {toast.type === 'info' && <Info className="w-6 h-6" />}
                        </div>
                        <p className="flex-1 text-sm font-medium leading-relaxed">
                            {typeof toast.message === 'string' ? toast.message : JSON.stringify(toast.message)}
                        </p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-3 hover:bg-white/20 rounded-full p-1 transition-all duration-200"
                            aria-label="Fermer la notification"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
