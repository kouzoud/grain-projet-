/**
 * Exemple d'utilisation du système d'optimisation WebP
 * Ce fichier montre comment utiliser tous les composants ensemble
 */
import React, { useState } from 'react';
import OptimizedImage, { OptimizedAvatar, OptimizedCardImage } from '../components/OptimizedImage';
import ImageUploader from '../components/ImageUploader';
import { useImageUpload } from '../hooks/useImageUpload';

const WebPOptimizationExample = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Données d'exemple d'images optimisées
  const sampleImages = [
    {
      id: 1,
      title: "Image Hero Responsive",
      src: "/images/hero.jpg",
      webpSrc: "/images/hero.webp",
      srcSet: "/images/hero-400w.jpg 400w, /images/hero-800w.jpg 800w, /images/hero-1200w.jpg 1200w",
      webpSrcSet: "/images/hero-400w.webp 400w, /images/hero-800w.webp 800w, /images/hero-1200w.webp 1200w"
    },
    {
      id: 2,
      title: "Avatar Utilisateur",
      src: "/images/avatar.jpg",
      webpSrc: "/images/avatar.webp"
    },
    {
      id: 3,
      title: "Image de Carte",
      src: "/images/card.jpg",
      webpSrc: "/images/card.webp"
    }
  ];

  const handleUploadComplete = (results) => {
    console.log('Images uploadées:', results);
    setUploadedImages(prev => [...prev, ...results]);
  };

  const handleUploadError = (errors) => {
    console.error('Erreurs d\'upload:', errors);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🚀 Système d'Optimisation WebP
        </h1>
        <p className="text-lg text-gray-600">
          Démonstration complète des composants et fonctionnalités
        </p>
      </div>

      {/* Section 1: Upload d'Images */}
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          📤 Upload et Conversion Automatique
        </h2>
        <ImageUploader
          uploadUrl="/api/upload"
          maxFiles={5}
          maxSizeMB={5}
          quality={0.85}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          showPreviews={true}
          showStats={true}
          showOptimizationSettings={true}
          additionalData={{
            category: 'demo',
            userId: 'example'
          }}
        />
      </section>

      {/* Section 2: Images Optimisées */}
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          🖼️ Affichage Optimisé
        </h2>
        
        <div className="grid gap-8">
          {/* Hero Image Responsive */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Image Hero Responsive
            </h3>
            <div className="relative h-64 rounded-lg overflow-hidden">
              <OptimizedImage
                src={sampleImages[0].src}
                webpSrc={sampleImages[0].webpSrc}
                srcSet={sampleImages[0].srcSet}
                webpSrcSet={sampleImages[0].webpSrcSet}
                sizes="(max-width: 768px) 100vw, 80vw"
                alt="Image hero responsive"
                className="w-full h-full"
                objectFit="cover"
                priority={true}
                lazy={false}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h4 className="text-2xl font-bold text-white">
                  WebP + Responsive + Priority Loading
                </h4>
              </div>
            </div>
          </div>

          {/* Galerie d'Avatars */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Avatars Optimisés
            </h3>
            <div className="flex gap-4">
              {['sm', 'md', 'lg', 'xl'].map(size => (
                <div key={size} className="text-center">
                  <OptimizedAvatar
                    src={sampleImages[1].src}
                    webpSrc={sampleImages[1].webpSrc}
                    alt="Avatar exemple"
                    size={size}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Taille: {size}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Grid de Cartes */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Images de Cartes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(index => (
                <div key={index} className="bg-gray-50 rounded-lg overflow-hidden">
                  <OptimizedCardImage
                    src={sampleImages[2].src}
                    webpSrc={sampleImages[2].webpSrc}
                    alt={`Carte exemple ${index}`}
                    aspectRatio="16/9"
                    onClick={() => setSelectedImage(index)}
                  />
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900">
                      Carte #{index}
                    </h4>
                    <p className="text-sm text-gray-600">
                      WebP + Lazy Loading + Aspect Ratio
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Images Uploadées */}
      {uploadedImages.length > 0 && (
        <section className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            ✅ Images Uploadées et Optimisées
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((img, index) => (
              <div key={index} className="relative group">
                <OptimizedImage
                  src={img.url}
                  webpSrc={img.webpUrl}
                  alt={`Image uploadée ${index + 1}`}
                  className="w-full rounded-lg"
                  aspectRatio="1"
                  objectFit="cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <p className="text-sm font-medium">{img.name}</p>
                    <p className="text-xs opacity-80">
                      {img.size ? `${(img.size / 1024).toFixed(0)} KB` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 4: Statistiques */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          📊 Avantages du WebP
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              25-35%
            </div>
            <p className="text-gray-700">
              Réduction de taille moyenne vs JPEG
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              50-80%
            </div>
            <p className="text-gray-700">
              Réduction vs PNG pour images avec transparence
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              96%+
            </div>
            <p className="text-gray-700">
              Support navigateur moderne
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Code Exemple */}
      <section className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          💻 Utilisation
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              1. Image Optimisée Simple
            </h3>
            <pre className="bg-white p-4 rounded-lg text-sm overflow-x-auto">
{`<OptimizedImage
  src="/images/photo.jpg"
  webpSrc="/images/photo.webp"
  alt="Photo optimisée"
  width={800}
  height={600}
  lazy={true}
/>`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              2. Uploader avec Conversion
            </h3>
            <pre className="bg-white p-4 rounded-lg text-sm overflow-x-auto">
{`<ImageUploader
  uploadUrl="/api/upload"
  maxFiles={5}
  quality={0.85}
  onUploadComplete={(results) => {
    console.log('Images uploadées:', results);
  }}
/>`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              3. Conversion des Images Existantes
            </h3>
            <pre className="bg-white p-4 rounded-lg text-sm overflow-x-auto">
{`# Convertir toutes les images
npm run convert-images

# Haute qualité
npm run convert-images:high-quality

# Configuration personnalisée
node scripts/convert-to-webp.js --quality 90 --sizes 400,800,1200`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WebPOptimizationExample;