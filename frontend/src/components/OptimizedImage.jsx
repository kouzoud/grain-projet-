/**
 * Composant OptimizedImage - Affichage optimisé d'images avec support WebP
 * Utilise l'élément <picture> pour le fallback et les images responsive
 */
import React, { useState, useRef, useEffect } from 'react';
import { Loader2, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { supportsWebP } from '../utils/imageConverter';

const OptimizedImage = ({
  // Sources d'images
  src,
  webpSrc,
  srcSet,
  webpSrcSet,
  
  // Attributs image standard
  alt = '',
  width,
  height,
  className = '',
  style = {},
  
  // Options d'optimisation
  lazy = true,
  responsive = true,
  quality = 'medium',
  placeholder = 'blur',
  
  // Tailles responsive
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  
  // Callbacks
  onLoad = () => {},
  onError = () => {},
  onClick = () => {},
  
  // Options avancées
  priority = false,
  fade = true,
  aspectRatio,
  objectFit = 'cover',
  
  // Fallback
  fallbackSrc,
  showErrorMessage = true,
  
  ...props
}) => {
  // États
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [webpSupported, setWebpSupported] = useState(null);
  
  // Références
  const imgRef = useRef(null);
  const intersectionObserver = useRef(null);
  
  // Vérifier le support WebP au montage
  useEffect(() => {
    setWebpSupported(supportsWebP());
  }, []);

  /**
   * Gestion du lazy loading avec Intersection Observer
   */
  useEffect(() => {
    if (!lazy || priority) return;

    const img = imgRef.current;
    if (!img) return;

    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // L'image est visible, charger l'image réelle
            const realSrc = getRealImageSrc();
            if (realSrc !== img.src) {
              img.src = realSrc;
              if (webpSrcSet || srcSet) {
                img.srcset = getRealImageSrcSet();
              }
            }
            
            // Arrêter d'observer une fois l'image chargée
            intersectionObserver.current.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px' // Charger 50px avant que l'image soit visible
      }
    );

    intersectionObserver.current.observe(img);

    return () => {
      if (intersectionObserver.current && img) {
        intersectionObserver.current.unobserve(img);
      }
    };
  }, [lazy, priority, webpSupported]);

  /**
   * Détermine la source d'image optimale
   */
  const getRealImageSrc = () => {
    if (webpSupported && webpSrc) {
      return webpSrc;
    }
    return src;
  };

  /**
   * Détermine le srcSet optimal
   */
  const getRealImageSrcSet = () => {
    if (webpSupported && webpSrcSet) {
      return webpSrcSet;
    }
    return srcSet;
  };

  /**
   * Génère un placeholder SVG blur
   */
  const generateBlurPlaceholder = (w = width || 400, h = height || 300) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  /**
   * Gestion du chargement de l'image
   */
  const handleImageLoad = () => {
    setLoading(false);
    setImageLoaded(true);
    setError(false);
    onLoad();
  };

  /**
   * Gestion des erreurs de chargement
   */
  const handleImageError = () => {
    setLoading(false);
    setError(true);
    setImageLoaded(false);
    
    // Essayer le fallback si disponible
    if (fallbackSrc && imgRef.current && imgRef.current.src !== fallbackSrc) {
      imgRef.current.src = fallbackSrc;
      return;
    }
    
    onError();
  };

  /**
   * Styles du conteneur
   */
  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    ...(aspectRatio && { aspectRatio }),
    ...style
  };

  /**
   * Styles de l'image
   */
  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit,
    transition: fade ? 'opacity 0.3s ease' : 'none',
    opacity: imageLoaded ? 1 : 0
  };

  /**
   * Source initiale (lazy loading ou normale)
   */
  const initialSrc = lazy && !priority 
    ? (placeholder === 'blur' ? generateBlurPlaceholder() : undefined)
    : getRealImageSrc();

  const initialSrcSet = lazy && !priority ? undefined : getRealImageSrcSet();

  // Si WebP supporté et webpSrc disponible, utiliser <picture>
  if (webpSupported && (webpSrc || webpSrcSet)) {
    return (
      <div className={`relative ${className}`} style={containerStyle} onClick={onClick}>
        <picture>
          {/* Source WebP */}
          <source
            srcSet={webpSrcSet || webpSrc}
            sizes={responsive ? sizes : undefined}
            type="image/webp"
          />
          
          {/* Source fallback */}
          <img
            ref={imgRef}
            src={initialSrc}
            srcSet={initialSrcSet}
            sizes={responsive ? sizes : undefined}
            alt={alt}
            width={width}
            height={height}
            style={imageStyle}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading={lazy && !priority ? 'lazy' : 'eager'}
            {...props}
          />
        </picture>

        {/* Indicateur de chargement */}
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}

        {/* Indicateur d'erreur */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
            <AlertTriangle className="w-8 h-8 mb-2" />
            {showErrorMessage && (
              <span className="text-sm text-center">
                Impossible de charger l'image
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Fallback pour navigateurs sans support WebP
  return (
    <div className={`relative ${className}`} style={containerStyle} onClick={onClick}>
      <img
        ref={imgRef}
        src={initialSrc}
        srcSet={initialSrcSet}
        sizes={responsive ? sizes : undefined}
        alt={alt}
        width={width}
        height={height}
        style={imageStyle}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={lazy && !priority ? 'lazy' : 'eager'}
        {...props}
      />

      {/* Indicateur de chargement */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Indicateur d'erreur */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
          <AlertTriangle className="w-8 h-8 mb-2" />
          {showErrorMessage && (
            <span className="text-sm text-center">
              Impossible de charger l'image
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Composant Avatar optimisé - cas d'usage spécifique
 */
export const OptimizedAvatar = ({ src, webpSrc, alt, size = 'md', className = '', ...props }) => {
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96
  };

  const sizeValue = sizes[size] || sizes.md;

  return (
    <OptimizedImage
      src={src}
      webpSrc={webpSrc}
      alt={alt}
      width={sizeValue}
      height={sizeValue}
      className={`rounded-full ${className}`}
      aspectRatio="1"
      objectFit="cover"
      lazy={false} // Les avatars sont souvent above the fold
      placeholder="blur"
      {...props}
    />
  );
};

/**
 * Composant Card Image optimisé - cas d'usage spécifique
 */
export const OptimizedCardImage = ({ 
  src, 
  webpSrc, 
  alt, 
  aspectRatio = '16/9', 
  className = '',
  ...props 
}) => {
  return (
    <OptimizedImage
      src={src}
      webpSrc={webpSrc}
      alt={alt}
      className={`w-full ${className}`}
      aspectRatio={aspectRatio}
      objectFit="cover"
      responsive={true}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      {...props}
    />
  );
};

/**
 * Composant Gallery Image optimisé - cas d'usage spécifique
 */
export const OptimizedGalleryImage = ({ 
  src, 
  webpSrc, 
  srcSet,
  webpSrcSet,
  alt, 
  className = '',
  onClick,
  ...props 
}) => {
  return (
    <OptimizedImage
      src={src}
      webpSrc={webpSrc}
      srcSet={srcSet}
      webpSrcSet={webpSrcSet}
      alt={alt}
      className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      aspectRatio="1"
      objectFit="cover"
      responsive={true}
      onClick={onClick}
      {...props}
    />
  );
};

export default OptimizedImage;