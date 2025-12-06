import React from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

/**
 * Composant Toast pour afficher des notifications
 */
const Toast = ({ type = 'info', message, onClose, autoClose = true, duration = 5000 }) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  if (!isVisible) return null;

  const styles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      icon: <CheckCircle className="text-green-500" size={20} />,
      text: 'text-green-800 dark:text-green-200'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: <XCircle className="text-red-500" size={20} />,
      text: 'text-red-800 dark:text-red-200'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      icon: <AlertCircle className="text-yellow-500" size={20} />,
      text: 'text-yellow-800 dark:text-yellow-200'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      icon: <Info className="text-blue-500" size={20} />,
      text: 'text-blue-800 dark:text-blue-200'
    }
  };

  const currentStyle = styles[type];

  return (
    <div
      className={`${currentStyle.bg} ${currentStyle.text} px-4 py-3 rounded-lg border shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-in slide-in-from-right duration-300`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0">{currentStyle.icon}</div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

Toast.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  autoClose: PropTypes.bool,
  duration: PropTypes.number
};

export default Toast;
