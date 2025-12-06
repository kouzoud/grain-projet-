/**
 * EXEMPLES D'UTILISATION - Système de Partage Social
 * 
 * Ce fichier contient des exemples pratiques d'utilisation
 * des composants et hooks de partage social.
 */

import React from 'react';
import SocialShareButton from '../components/common/SocialShareButton';
import AdvancedSocialShare from '../components/common/AdvancedSocialShare';
import useSocialShare from '../hooks/useSocialShare';
// import { useDispatch } from 'react-redux'; // Décommenter si vous utilisez Redux

// ========================================
// EXEMPLE 1 : Utilisation basique
// ========================================

export const BasicExample = () => {
  const request = {
    id: 123,
    titre: "Famille dans le besoin",
    description: "Une famille de 5 personnes a besoin d'aide alimentaire d'urgence...",
    ville: "Casablanca"
  };

  return (
    <SocialShareButton
      title={request.titre}
      description={request.description}
      caseId={request.id}
      ville={request.ville}
    />
  );
};

// ========================================
// EXEMPLE 2 : Avec label visible
// ========================================

export const WithLabelExample = () => {
  return (
    <SocialShareButton
      title="Aide médicale urgente"
      description="Besoin de médicaments pour un enfant malade..."
      caseId={456}
      ville="Rabat"
      showLabel={true}  // ← Affiche "Partager"
      className="bg-blue-100 hover:bg-blue-200"
    />
  );
};

// ========================================
// EXEMPLE 3 : Version avancée avec boutons directs
// ========================================

export const AdvancedExample = () => {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h3 className="text-lg font-bold mb-4">Partagez cette demande</h3>
      
      <AdvancedSocialShare
        title="Logement d'urgence"
        description="Une famille expulsée cherche un logement temporaire..."
        caseId={789}
        ville="Marrakech"
        variant="full"              // 'minimal' ou 'full'
        showDirectButtons={true}    // Afficher WhatsApp/Facebook/Twitter
      />
    </div>
  );
};

// ========================================
// EXEMPLE 4 : Utilisation du hook personnalisé
// ========================================

export const CustomHookExample = () => {
  const {
    share,
    shareOnWhatsApp,
    isSharing,
    canShare,
    isMobile
  } = useSocialShare({
    trackAnalytics: true,
    onSuccess: (data) => {
      console.log('Partage réussi:', data);
      // Envoyer à votre backend pour tracking
    },
    onError: (error) => {
      console.error('Erreur:', error);
    }
  });

  const handleShare = async () => {
    await share({
      title: "🆘 Aide Urgente",
      text: "Une famille a besoin de votre aide...",
      url: "https://solidarlink.com/?caseId=999"
    });
  };

  const handleWhatsAppShare = () => {
    const message = "Regarde cette demande d'aide urgente sur SolidarLink !";
    shareOnWhatsApp(message);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleShare}
        disabled={isSharing}
        className="btn btn-primary"
      >
        {isSharing ? 'Partage...' : 'Partager'}
      </button>

      <button
        onClick={handleWhatsAppShare}
        className="btn btn-success"
      >
        Partager sur WhatsApp
      </button>

      <div className="text-sm text-gray-600">
        {isMobile && <p>📱 Vous êtes sur mobile</p>}
        {canShare && <p>✅ Web Share API disponible</p>}
      </div>
    </div>
  );
};

// ========================================
// EXEMPLE 5 : Dans un composant de liste
// ========================================

export const ListExample = () => {
  const requests = [
    { id: 1, titre: "Aide alimentaire", description: "...", ville: "Casablanca" },
    { id: 2, titre: "Aide médicale", description: "...", ville: "Rabat" },
    { id: 3, titre: "Aide logement", description: "...", ville: "Tanger" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {requests.map((request) => (
        <div key={request.id} className="card">
          <h3>{request.titre}</h3>
          <p>{request.description}</p>
          
          {/* Bouton de partage pour chaque carte */}
          <div className="flex justify-end">
            <SocialShareButton
              title={request.titre}
              description={request.description}
              caseId={request.id}
              ville={request.ville}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// ========================================
// EXEMPLE 6 : Avec tracking personnalisé
// ========================================

export const TrackingExample = () => {
  const { share } = useSocialShare({
    trackAnalytics: true,
    onSuccess: async (data) => {
      // Envoyer à votre backend
      await fetch('/api/analytics/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: 123,
          method: data.method,
          platform: data.platform,
          timestamp: new Date().toISOString()
        })
      });
    }
  });

  return (
    <button onClick={() => share({
      title: "Aide urgente",
      text: "Description...",
      url: window.location.href
    })}>
      Partager avec tracking
    </button>
  );
};

// ========================================
// EXEMPLE 7 : Modal de partage personnalisé
// ========================================

export const ShareModalExample = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { shareOnWhatsApp, shareOnFacebook, shareOnTwitter } = useSocialShare();

  const shareData = {
    title: "Aide urgente à Casablanca",
    url: "https://solidarlink.com/?caseId=123"
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn">
        Partager
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Partager cette demande</h2>
        
        <div className="space-y-3">
          <button
            onClick={() => {
              shareOnWhatsApp(`${shareData.title} - ${shareData.url}`);
              setIsOpen(false);
            }}
            className="w-full btn bg-green-500 hover:bg-green-600 text-white"
          >
            📱 WhatsApp
          </button>

          <button
            onClick={() => {
              shareOnFacebook(shareData.url);
              setIsOpen(false);
            }}
            className="w-full btn bg-blue-600 hover:bg-blue-700 text-white"
          >
            👍 Facebook
          </button>

          <button
            onClick={() => {
              shareOnTwitter(shareData.title, shareData.url);
              setIsOpen(false);
            }}
            className="w-full btn bg-sky-500 hover:bg-sky-600 text-white"
          >
            🐦 Twitter
          </button>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="mt-4 w-full btn btn-ghost"
        >
          Annuler
        </button>
      </div>
    </div>
  );
};

// ========================================
// EXEMPLE 8 : Intégration avec Redux/Context
// ========================================

export const ReduxExample = () => {
  // Supposons que vous ayez Redux configuré
  // const dispatch = useDispatch(); // Décommenter si vous utilisez Redux
  const { share } = useSocialShare({
    onSuccess: (data) => {
      // Mettre à jour le store Redux
      // dispatch({
      //   type: 'SHARE_SUCCESS',
      //   payload: {
      //     caseId: 123,
      //     shareCount: 1,
      //     method: data.method
      //   }
      // });
      console.log('Partage réussi:', data);
    }
  });

  return (
    <button onClick={() => share({
      title: "Aide urgente",
      text: "Description...",
      url: "https://solidarlink.com/?caseId=123"
    })}>
      Partager (avec Redux)
    </button>
  );
};

// ========================================
// EXEMPLE 9 : Bouton de partage dans un header
// ========================================

export const HeaderShareButton = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">SolidarLink</h1>
        
        <div className="flex items-center gap-4">
          <nav>...</nav>
          
          {/* Bouton de partage dans le header */}
          <SocialShareButton
            title="Rejoignez SolidarLink"
            description="Plateforme d'entraide humanitaire au Maroc"
            caseId={0}  // ID spécial pour la page d'accueil
            showLabel={true}
            className="bg-primary text-white px-4 py-2 rounded-lg"
          />
        </div>
      </div>
    </header>
  );
};

// ========================================
// EXEMPLE 10 : Partage programmatique après action
// ========================================

export const ProgrammaticShareExample = () => {
  const { share } = useSocialShare();

  const handleDonationComplete = async (caseId) => {
    // Après qu'un utilisateur ait aidé, proposer de partager
    const shouldShare = window.confirm(
      "Merci pour votre aide ! Voulez-vous partager cette demande pour aider davantage ?"
    );

    if (shouldShare) {
      await share({
        title: "J'ai aidé une famille dans le besoin !",
        text: "Vous aussi, vous pouvez faire la différence...",
        url: `https://solidarlink.com/?caseId=${caseId}`
      });
    }
  };

  return (
    <button onClick={() => handleDonationComplete(123)}>
      Confirmer mon aide
    </button>
  );
};

// ========================================
// EXPORTER TOUS LES EXEMPLES
// ========================================

export default {
  BasicExample,
  WithLabelExample,
  AdvancedExample,
  CustomHookExample,
  ListExample,
  TrackingExample,
  ShareModalExample,
  ReduxExample,
  HeaderShareButton,
  ProgrammaticShareExample
};
