import { Share2, MessageCircle, Facebook, Twitter } from 'lucide-react';
import useSocialShare from '../../hooks/useSocialShare';

/**
 * Composant de partage social avancé avec boutons directs
 * @param {string} title - Titre de la demande
 * @param {string} description - Description courte
 * @param {number} caseId - ID unique de la demande
 * @param {string} ville - Ville de la demande (optionnel)
 * @param {boolean} showDirectButtons - Afficher les boutons WhatsApp/Facebook/Twitter
 * @param {string} variant - Style du composant ('minimal' | 'full')
 */
const AdvancedSocialShare = ({ 
  title, 
  description, 
  caseId, 
  ville = '', 
  showDirectButtons = false,
  variant = 'minimal'
}) => {
  const {
    share,
    shareOnWhatsApp,
    shareOnFacebook,
    shareOnTwitter,
    isSharing,
    canShare,
    isMobile
  } = useSocialShare({
    trackAnalytics: true,
    onSuccess: (data) => {
      console.log('Partage réussi:', data);
    }
  });

  // Construction du contenu
  const shareUrl = `${window.location.origin}/?caseId=${caseId}`;
  const shareTitle = `🆘 Aide Urgente : ${title}`;
  const shareText = `Besoin d'aide ${ville ? `à ${ville}` : ''}.\n\n${description.substring(0, 150)}${description.length > 150 ? '...' : ''}\n\n👉 Aidez-nous sur SolidarLink !`;
  const fullMessage = `${shareTitle}\n\n${shareText}\n\n${shareUrl}`;

  const handleGenericShare = async () => {
    await share({
      title: shareTitle,
      text: shareText,
      url: shareUrl
    });
  };

  // Variant minimal (comme l'original)
  if (variant === 'minimal') {
    return (
      <div className="relative group">
        <button
          onClick={handleGenericShare}
          disabled={isSharing}
          className="
            flex items-center gap-2 
            text-blue-500 hover:bg-blue-50 
            rounded-full p-2 
            transition-all duration-200
            hover:scale-110
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          aria-label="Partager cette demande"
        >
          <Share2 className={`w-5 h-5 ${isSharing ? 'animate-pulse' : ''}`} />
        </button>

        {/* Tooltip */}
        <div className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          px-3 py-1.5 
          bg-gray-900 text-white text-xs rounded-lg
          opacity-0 group-hover:opacity-100
          pointer-events-none
          transition-opacity duration-200
          whitespace-nowrap
          z-10
        ">
          Partager cette demande
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  // Variant full avec boutons directs
  return (
    <div className="space-y-3">
      {/* Bouton de partage générique */}
      <button
        onClick={handleGenericShare}
        disabled={isSharing}
        className="
          w-full flex items-center justify-center gap-2 
          bg-blue-500 hover:bg-blue-600 text-white
          px-4 py-3 rounded-lg
          font-medium text-sm
          transition-all duration-200
          hover:shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <Share2 className={`w-5 h-5 ${isSharing ? 'animate-pulse' : ''}`} />
        {canShare ? 'Partager' : 'Copier le lien'}
      </button>

      {/* Boutons directs */}
      {showDirectButtons && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs text-gray-500 bg-white px-2">
              <span className="px-2 bg-white">ou partager sur</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* WhatsApp */}
            <button
              onClick={() => shareOnWhatsApp(fullMessage)}
              className="
                flex flex-col items-center gap-1
                bg-green-50 hover:bg-green-100
                text-green-600 hover:text-green-700
                p-3 rounded-lg
                transition-colors duration-200
                border border-green-200
              "
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs font-medium">WhatsApp</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => shareOnFacebook(shareUrl)}
              className="
                flex flex-col items-center gap-1
                bg-blue-50 hover:bg-blue-100
                text-blue-600 hover:text-blue-700
                p-3 rounded-lg
                transition-colors duration-200
                border border-blue-200
              "
            >
              <Facebook className="w-5 h-5" />
              <span className="text-xs font-medium">Facebook</span>
            </button>

            {/* Twitter */}
            <button
              onClick={() => shareOnTwitter(shareText, shareUrl)}
              className="
                flex flex-col items-center gap-1
                bg-sky-50 hover:bg-sky-100
                text-sky-600 hover:text-sky-700
                p-3 rounded-lg
                transition-colors duration-200
                border border-sky-200
              "
            >
              <Twitter className="w-5 h-5" />
              <span className="text-xs font-medium">Twitter</span>
            </button>
          </div>
        </>
      )}

      {/* Info sur la plateforme */}
      {isMobile && canShare && (
        <p className="text-xs text-gray-500 text-center">
          📱 Menu de partage de votre téléphone
        </p>
      )}
    </div>
  );
};

export default AdvancedSocialShare;
