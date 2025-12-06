import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * Composant de partage social intelligent avec support mobile/desktop
 * @param {string} title - Titre de la demande
 * @param {string} description - Description courte
 * @param {number} caseId - ID unique de la demande
 * @param {string} ville - Ville de la demande (optionnel)
 * @param {string} className - Classes CSS supplémentaires (optionnel)
 * @param {boolean} showLabel - Afficher le label "Partager" (optionnel)
 */
const SocialShareButton = ({ 
  title, 
  description, 
  caseId, 
  ville = '', 
  className = '',
  showLabel = false 
}) => {
  const [isSharing, setIsSharing] = useState(false);

  // Construction du lien profond
  const shareUrl = `${window.location.origin}/?caseId=${caseId}`;
  
  // Construction du message de partage optimisé avec URGENT
  const villeText = ville ? ` à ${ville}` : '';
  const shareTitle = `🔴 URGENT : ${title}`;
  const shareText = `🔴 URGENT : ${title} a besoin d'aide${villeText} !\n\nCliquez pour voir les détails et aider :`;

  const handleShare = async () => {
    setIsSharing(true);

    try {
      // Vérification du support du partage natif (mobile)
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: `${shareText}\n\n${shareUrl}`,
        });
        
        toast.success('Merci d\'avoir partagé cette demande ! 🙏', {
          duration: 3000,
          icon: '✨',
        });
      } else {
        // Fallback pour desktop : copie dans le presse-papier
        const fullMessage = `${shareText}\n\n${shareUrl}`;
        
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
      }
    } catch (error) {
      // L'utilisateur a annulé le partage ou erreur
      if (error.name !== 'AbortError') {
        console.error('Erreur de partage:', error);
        toast.error('Impossible de partager pour le moment', {
          duration: 3000,
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`
          flex items-center gap-2 
          text-blue-500 hover:bg-blue-50 
          rounded-full p-2 
          transition-all duration-200
          hover:scale-110
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        aria-label="Partager cette demande"
        title="Partager cette demande"
      >
        <Share2 
          className={`w-5 h-5 ${isSharing ? 'animate-pulse' : ''}`} 
        />
        {showLabel && (
          <span className="text-sm font-medium">Partager</span>
        )}
      </button>

      {/* Tooltip au survol */}
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
};

export default SocialShareButton;
