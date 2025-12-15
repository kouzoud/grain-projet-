# 📸 Système d'Optimisation WebP

Un système complet d'optimisation d'images WebP pour votre application React avec conversion automatique, upload optimisé et affichage responsive.

## 🚀 Installation

Les dépendances sont déjà configurées dans `package.json`. Pour installer :

```bash
cd frontend
npm install
```

## 📦 Composants Principaux

### 1. 🖼️ OptimizedImage

Composant d'affichage d'images optimisé avec support WebP automatique :

```jsx
import OptimizedImage, { OptimizedAvatar, OptimizedCardImage } from './components/OptimizedImage';

// Usage basique
<OptimizedImage 
  src="/images/photo.jpg"
  webpSrc="/images/photo.webp"
  alt="Description"
  width={800}
  height={600}
/>

// Avec images responsive
<OptimizedImage 
  src="/images/photo.jpg"
  srcSet="/images/photo-400w.jpg 400w, /images/photo-800w.jpg 800w"
  webpSrcSet="/images/photo-400w.webp 400w, /images/photo-800w.webp 800w"
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Photo responsive"
/>

// Avatar optimisé
<OptimizedAvatar 
  src="/images/avatar.jpg"
  webpSrc="/images/avatar.webp"
  alt="Avatar utilisateur"
  size="lg"
/>

// Image de card
<OptimizedCardImage 
  src="/images/card.jpg"
  webpSrc="/images/card.webp"
  alt="Image de carte"
  aspectRatio="16/9"
/>
```

**Fonctionnalités :**
- ✅ Support WebP automatique avec fallback
- ✅ Lazy loading intelligent
- ✅ Placeholder blur personnalisable
- ✅ Images responsive avec `<picture>`
- ✅ Gestion d'erreurs avec fallback
- ✅ Animation de fade-in
- ✅ Optimisation des performances

### 2. 📤 ImageUploader

Composant d'upload complet avec drag & drop et conversion automatique :

```jsx
import ImageUploader from './components/ImageUploader';

<ImageUploader
  uploadUrl="/api/upload"
  maxFiles={5}
  maxSizeMB={5}
  quality={0.85}
  onUploadComplete={(results) => console.log('Uploadé:', results)}
  onUploadError={(errors) => console.log('Erreurs:', errors)}
  showPreviews={true}
  showStats={true}
  autoUpload={false}
/>
```

**Fonctionnalités :**
- ✅ Drag & drop intuitif
- ✅ Conversion WebP automatique
- ✅ Prévisualisation en temps réel
- ✅ Barre de progression
- ✅ Gestion d'erreurs détaillée
- ✅ Statistiques d'optimisation
- ✅ Upload par batch
- ✅ Annulation d'upload

### 3. 🔧 Hook useImageUpload

Hook personnalisé pour la logique d'upload :

```jsx
import { useImageUpload } from './hooks/useImageUpload';

const MyComponent = () => {
  const {
    files,
    previews,
    uploading,
    progress,
    errors,
    addFiles,
    uploadFiles,
    removeFile,
    clearFiles
  } = useImageUpload({
    maxFiles: 10,
    maxSizeMB: 3,
    quality: 0.8,
    onUploadComplete: (results) => {
      console.log('Upload terminé:', results);
    }
  });

  return (
    <div>
      <input 
        type="file" 
        multiple 
        onChange={(e) => addFiles(e.target.files)}
      />
      <button onClick={() => uploadFiles('/api/upload')}>
        Uploader
      </button>
    </div>
  );
};
```

## 🛠️ Scripts de Conversion

### Conversion des Images Existantes

```bash
# Conversion basique
npm run convert-images

# Haute qualité (90%)
npm run convert-images:high-quality

# Écraser les fichiers existants
npm run convert-images:overwrite

# Configuration personnalisée
npm run convert-images:custom

# Ou directement avec Node
node scripts/convert-to-webp.js --quality 85 --sizes 400,800,1200
```

**Options disponibles :**
- `--quality [1-100]` : Qualité WebP (défaut: 85)
- `--sizes [liste]` : Tailles responsive (ex: 400,800,1200)
- `--overwrite` : Écraser les fichiers existants
- `--no-preserve` : Ne pas conserver les originaux
- `--help` : Afficher l'aide

### Exemple de Sortie

```
🚀 Démarrage de la conversion WebP...
📁 Dossier d'entrée: ./src/assets
📁 Dossier de sortie: ./src/assets
🎛️  Qualité WebP: 85

📸 12 images trouvées

[1/12] Traitement en cours...
Conversion de ./src/assets/hero-image.jpg...
  → hero-image-400w.webp créé
  → hero-image-800w.webp créé
  → hero-image-1200w.webp créé

📊 RAPPORT DE CONVERSION WebP
══════════════════════════════════════════════════
✅ Images converties: 12
❌ Échecs: 0
💾 Taille originale: 15.4 MB
📦 Taille WebP: 8.2 MB
🎯 Économie: 7.2 MB (46.8%)
```

## 🔧 Utilitaires

### imageConverter.js

Fonctions utilitaires pour la conversion :

```jsx
import {
  convertToWebP,
  validateImage,
  createImagePreview,
  generateResponsiveSizes,
  formatFileSize
} from './utils/imageConverter';

// Convertir un fichier
const result = await convertToWebP(file, { quality: 0.8 });
console.log(`Économie: ${result.compressionRatio}%`);

// Valider une image
const validation = await validateImage(file, {
  maxSizeMB: 5,
  maxWidth: 1920,
  maxHeight: 1920
});

if (!validation.valid) {
  console.log('Erreurs:', validation.errors);
}

// Générer plusieurs tailles
const responsiveSizes = await generateResponsiveSizes(file, [400, 800, 1200]);
```

### imageUploadService.js

Service d'upload avec retry automatique :

```jsx
import imageUploadService from './services/imageUploadService';

// Upload simple
try {
  const result = await imageUploadService.uploadSingleFile(file, {
    endpoint: '/api/upload',
    additionalData: { category: 'profile' },
    onProgress: (progress) => console.log(`${progress}%`)
  });
  console.log('Uploadé:', result.data);
} catch (error) {
  console.error('Erreur:', error.message);
}

// Upload multiple
const results = await imageUploadService.uploadMultipleFiles(files, {
  onFileComplete: (result, index) => {
    console.log(`Fichier ${index + 1} terminé`);
  },
  maxConcurrency: 3
});

console.log(`${results.completed}/${results.total} fichiers uploadés`);

// Upload d'avatar
const avatar = await imageUploadService.uploadAvatar(file, {
  sizes: [32, 48, 64, 96, 128],
  quality: 0.9
});
```

## 📱 Exemples d'Usage

### 1. Galerie d'Images

```jsx
import { OptimizedGalleryImage } from './components/OptimizedImage';

const Gallery = ({ images }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map(img => (
        <OptimizedGalleryImage
          key={img.id}
          src={img.url}
          webpSrc={img.webpUrl}
          srcSet={img.srcSet}
          webpSrcSet={img.webpSrcSet}
          alt={img.alt}
          onClick={() => openLightbox(img)}
        />
      ))}
    </div>
  );
};
```

### 2. Upload avec Prévisualisation

```jsx
const ProfileUpload = () => {
  const [uploadedImages, setUploadedImages] = useState([]);

  return (
    <div>
      <ImageUploader
        uploadUrl="/api/profile/photos"
        maxFiles={3}
        maxSizeMB={2}
        compact={true}
        onUploadComplete={(results) => {
          setUploadedImages(prev => [...prev, ...results]);
        }}
        additionalData={{
          userId: user.id,
          category: 'profile'
        }}
      />
      
      <div className="mt-4 grid grid-cols-3 gap-2">
        {uploadedImages.map(img => (
          <OptimizedImage
            key={img.id}
            src={img.url}
            webpSrc={img.webpUrl}
            alt="Photo de profil"
            className="rounded-lg"
            aspectRatio="1"
          />
        ))}
      </div>
    </div>
  );
};
```

### 3. Image Hero Responsive

```jsx
const HeroSection = () => {
  return (
    <div className="relative h-screen">
      <OptimizedImage
        src="/images/hero-1920.jpg"
        webpSrc="/images/hero-1920.webp"
        srcSet="/images/hero-400.jpg 400w, /images/hero-800.jpg 800w, /images/hero-1200.jpg 1200w, /images/hero-1920.jpg 1920w"
        webpSrcSet="/images/hero-400.webp 400w, /images/hero-800.webp 800w, /images/hero-1200.webp 1200w, /images/hero-1920.webp 1920w"
        sizes="100vw"
        alt="Image hero"
        className="w-full h-full"
        objectFit="cover"
        priority={true}
        lazy={false}
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <h1 className="text-6xl font-bold text-white">Mon Site Web</h1>
      </div>
    </div>
  );
};
```

## ⚙️ Configuration Avancée

### Variables d'Environnement

```env
# .env.local
REACT_APP_API_BASE_URL=https://api.monsite.com
REACT_APP_MAX_FILE_SIZE=5242880
REACT_APP_WEBP_QUALITY=85
```

### Configuration Vite

```js
// vite.config.js
export default defineConfig({
  // ... autres configurations
  build: {
    rollupOptions: {
      output: {
        // Optimiser les chunks d'images
        manualChunks: {
          'image-libs': ['browser-image-compression']
        }
      }
    }
  }
});
```

## 🔍 Monitoring des Performances

```jsx
// Exemple de suivi des performances
const ImagePerformanceTracker = () => {
  const [stats, setStats] = useState({
    totalImages: 0,
    webpSupported: false,
    averageLoadTime: 0,
    bandwidthSaved: 0
  });

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      webpSupported: supportsWebP()
    }));
  }, []);

  return (
    <div className="bg-gray-100 p-4 rounded-lg text-sm">
      <h3 className="font-semibold mb-2">Performance Images</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>WebP Support: {stats.webpSupported ? '✅' : '❌'}</div>
        <div>Images chargées: {stats.totalImages}</div>
        <div>Temps moyen: {stats.averageLoadTime}ms</div>
        <div>Bande passante économisée: {formatFileSize(stats.bandwidthSaved)}</div>
      </div>
    </div>
  );
};
```

## 🚨 Gestion d'Erreurs

```jsx
// ErrorBoundary spécialisé pour les images
class ImageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erreur image:', error, errorInfo);
    // Logger vers service externe
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-gray-200 flex items-center justify-center h-48">
          <AlertTriangle className="w-8 h-8 text-gray-400" />
          <span className="ml-2 text-gray-600">Image indisponible</span>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 📊 Métriques de Performance

Le système fournit des métriques détaillées :

- **Taux de compression** : Réduction de taille moyenne
- **Temps de chargement** : Performance des images optimisées
- **Support navigateur** : Détection automatique WebP
- **Bande passante économisée** : Calcul des économies
- **Taux d'erreur** : Suivi des échecs d'upload/affichage

## 🔧 Dépannage

### Problèmes Courants

**1. Images ne se chargent pas**
- Vérifier les URLs des images
- Contrôler la configuration CORS
- Tester le support WebP du navigateur

**2. Upload lent**
- Réduire la qualité de compression
- Diminuer le nombre de fichiers simultanés
- Vérifier la taille des fichiers

**3. Erreurs de conversion**
- S'assurer que les dépendances sont installées
- Vérifier les permissions de fichiers
- Contrôler les formats supportés

## 🎯 Bonnes Pratiques

1. **Utilisez WebP** pour toutes les nouvelles images
2. **Générez plusieurs tailles** pour le responsive
3. **Implémentez le lazy loading** pour les images below-the-fold
4. **Optimisez la qualité** selon le contexte (photos vs icônes)
5. **Surveillez les performances** avec les métriques intégrées
6. **Testez sur différents navigateurs** pour la compatibilité

## 🚀 Déploiement

Avant le déploiement en production :

1. Convertir toutes les images existantes :
   ```bash
   npm run convert-images
   ```

2. Optimiser la configuration serveur pour WebP :
   ```nginx
   # nginx.conf
   location ~* \.(webp)$ {
     add_header Cache-Control "public, max-age=31536000";
   }
   ```

3. Configurer les headers CORS appropriés

4. Tester les performances avec Lighthouse

---

**🎉 Votre système d'optimisation WebP est maintenant prêt !**

Pour toute question ou suggestion d'amélioration, consultez la documentation des composants individuels ou créez une issue.