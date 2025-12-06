import React from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

/**
 * Composant pour afficher les messages d'erreur de manière conviviale
 */
const ErrorMessage = ({ 
    type = 'error', 
    message, 
    title,
    description,
    actionButton,
    className = '' 
}) => {
    const styles = {
        error: {
            container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
            icon: <XCircle className="text-red-500" size={24} />,
            titleColor: 'text-red-800 dark:text-red-200',
            textColor: 'text-red-700 dark:text-red-300'
        },
        warning: {
            container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
            icon: <AlertCircle className="text-yellow-500" size={24} />,
            titleColor: 'text-yellow-800 dark:text-yellow-200',
            textColor: 'text-yellow-700 dark:text-yellow-300'
        },
        info: {
            container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
            icon: <Info className="text-blue-500" size={24} />,
            titleColor: 'text-blue-800 dark:text-blue-200',
            textColor: 'text-blue-700 dark:text-blue-300'
        },
        success: {
            container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
            icon: <CheckCircle className="text-green-500" size={24} />,
            titleColor: 'text-green-800 dark:text-green-200',
            textColor: 'text-green-700 dark:text-green-300'
        }
    };

    const currentStyle = styles[type];

    // Friendly error messages mapping
    const friendlyMessages = {
        'Network Error': 'Problème de connexion réseau. Vérifiez votre connexion internet et réessayez.',
        'Request failed with status code 401': 'Votre session a expiré. Veuillez vous reconnecter.',
        'Request failed with status code 403': 'Vous n\'avez pas les permissions nécessaires pour cette action.',
        'Request failed with status code 404': 'La ressource demandée est introuvable.',
        'Request failed with status code 500': 'Une erreur est survenue sur le serveur. Veuillez réessayer plus tard.',
        'timeout': 'La requête a pris trop de temps. Vérifiez votre connexion et réessayez.'
    };

    const displayMessage = friendlyMessages[message] || message || 'Une erreur inattendue s\'est produite.';

    return (
        <div 
            className={`${currentStyle.container} border rounded-lg p-4 ${className}`}
            role="alert"
            aria-live="polite"
        >
            <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {currentStyle.icon}
                </div>
                <div className="flex-1">
                    {title && (
                        <h3 className={`text-sm font-bold mb-1 ${currentStyle.titleColor}`}>
                            {title}
                        </h3>
                    )}
                    <p className={`text-sm ${currentStyle.textColor}`}>
                        {displayMessage}
                    </p>
                    {description && (
                        <p className={`text-xs mt-2 ${currentStyle.textColor} opacity-80`}>
                            {description}
                        </p>
                    )}
                    {actionButton && (
                        <div className="mt-3">
                            {actionButton}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

ErrorMessage.propTypes = {
    type: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
    message: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    actionButton: PropTypes.node,
    className: PropTypes.string
};

/**
 * Composant pour afficher les erreurs de formulaire
 */
export const FormError = ({ error, className = '' }) => {
    if (!error) return null;

    return (
        <ErrorMessage 
            type="error"
            message={error}
            className={`mb-4 ${className}`}
        />
    );
};

FormError.propTypes = {
    error: PropTypes.string,
    className: PropTypes.string
};

/**
 * Composant pour afficher une page d'erreur complète
 */
export const ErrorPage = ({ 
    title = 'Oops!',
    message = 'Une erreur inattendue s\'est produite.',
    onRetry,
    onGoHome
}) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <XCircle className="text-red-500" size={48} />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {message}
                </p>
                <div className="flex gap-3 justify-center">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Réessayer
                        </button>
                    )}
                    {onGoHome && (
                        <button
                            onClick={onGoHome}
                            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
                        >
                            Retour à l'accueil
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

ErrorPage.propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    onRetry: PropTypes.func,
    onGoHome: PropTypes.func
};

export default ErrorMessage;
