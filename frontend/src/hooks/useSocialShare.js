import { useState } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Hook personnalisé pour gérer le partage social avec fallback intelligent
 * @param {Object} options - Options de configuration
 * @param {Function} options.onSuccess - Callback après partage réussi
 * @param {Function} options.onError - Callback après erreur
 * @param {boolean} options.trackAnalytics - Activer le tracking (Google Analytics)
 * @returns {Object} État et fonctions de partage
 */
export const useSocialShare = (options = {}) => {
  const {
    onSuccess,
    onError,
    trackAnalytics = false
  } = options;

  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState(null);

  /**
   * Fonction principale de partage
   * @param {Object} data - Données à partager
   * @param {string} data.title - Titre du contenu
   * @param {string} data.text - Description/texte
   * @param {string} data.url - URL à partager
   */
  const share = async ({ title, text, url }) => {
    setIsSharing(true);
    setShareError(null);

    try {
      // Vérifier si Web Share API est disponible
      if (navigator.share) {
        await navigator.share({ title, text, url });
        
        // Toast de succès
        toast.success('Merci d\'avoir partagé ! 🙏', {
          duration: 3000,
          icon: '✨',
        });

        // Callback de succès
        if (onSuccess) {
          onSuccess({ method: 'native', platform: 'unknown' });
        }

        // Analytics
        if (trackAnalytics && window.gtag) {
          window.gtag('event', 'share', {
            method: 'Web Share API',
            content_type: 'humanitarian_case',
            item_id: url.split('caseId=')[1] || 'unknown'
          });
        }

      } else {
        // Fallback : Copier dans le presse-papier
        const fullMessage = `${title}\n\n${text}\n\n${url}`;
        await navigator.clipboard.writeText(fullMessage);
        
        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Lien copié ! 📋</span>
            <span className="text-sm text-gray-600">
              Collez-le sur WhatsApp, Facebook ou Twitter
            </span>
          </div>,
          {
            duration: 4000,
            icon: '✅',
          }
        );

        // Callback de succès
        if (onSuccess) {
          onSuccess({ method: 'clipboard', platform: 'unknown' });
        }

        // Analytics
        if (trackAnalytics && window.gtag) {
          window.gtag('event', 'share', {
            method: 'Clipboard',
            content_type: 'humanitarian_case',
            item_id: url.split('caseId=')[1] || 'unknown'
          });
        }
      }

    } catch (error) {
      // Gérer les erreurs (sauf annulation utilisateur)
      if (error.name !== 'AbortError') {
        console.error('Erreur de partage:', error);
        
        const errorMessage = 'Impossible de partager pour le moment';
        setShareError(errorMessage);
        
        toast.error(errorMessage, {
          duration: 3000,
        });

        // Callback d'erreur
        if (onError) {
          onError(error);
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  /**
   * Partage direct sur WhatsApp (sans Web Share API)
   * @param {string} message - Message à partager
   */
  const shareOnWhatsApp = (message) => {
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');

    if (trackAnalytics && window.gtag) {
      window.gtag('event', 'share', {
        method: 'WhatsApp Direct',
        content_type: 'humanitarian_case',
      });
    }
  };

  /**
   * Partage direct sur Facebook
   * @param {string} url - URL à partager
   */
  const shareOnFacebook = (url) => {
    const encoded = encodeURIComponent(url);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encoded}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');

    if (trackAnalytics && window.gtag) {
      window.gtag('event', 'share', {
        method: 'Facebook Direct',
        content_type: 'humanitarian_case',
      });
    }
  };

  /**
   * Partage direct sur Twitter
   * @param {string} text - Texte du tweet
   * @param {string} url - URL à partager
   */
  const shareOnTwitter = (text, url) => {
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');

    if (trackAnalytics && window.gtag) {
      window.gtag('event', 'share', {
        method: 'Twitter Direct',
        content_type: 'humanitarian_case',
      });
    }
  };

  /**
   * Vérifier si Web Share API est disponible
   * @returns {boolean}
   */
  const canShare = () => {
    return typeof navigator !== 'undefined' && !!navigator.share;
  };

  /**
   * Vérifier si l'appareil est mobile
   * @returns {boolean}
   */
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  return {
    // État
    isSharing,
    shareError,
    canShare: canShare(),
    isMobile: isMobile(),

    // Fonctions
    share,
    shareOnWhatsApp,
    shareOnFacebook,
    shareOnTwitter,
  };
};

export default useSocialShare;
