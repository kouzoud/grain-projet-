/**
 * Utilitaires pour la conversion et l'optimisation d'images WebP côté client
 */
import imageCompression from 'browser-image-compression';

/**
 * Configuration par défaut pour l'optimisation
 */
export const IMAGE_CONFIG = {
  // Formats supportés
  SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  
  // Tailles maximales (en pixels)
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1920,
  
  // Qualité et compression
  QUALITY: 0.85,
  MAX_SIZE_MB: 5,
  
  // Tailles responsive générées
  RESPONSIVE_SIZES: [400, 800, 1200, 1920],
  
  // Types d'optimisation
  OPTIMIZATION_LEVELS: {
    low: { quality: 0.9, maxSizeMB: 3 },
    medium: { quality: 0.85, maxSizeMB: 2 },
    high: { quality: 0.75, maxSizeMB: 1 },
    ultra: { quality: 0.65, maxSizeMB: 0.5 }
  }
};

/**
 * Vérifie si le format d'image est supporté
 */
export function isSupportedImageFormat(file) {
  if (!file || !file.type) return false;
  return IMAGE_CONFIG.SUPPORTED_FORMATS.includes(file.type.toLowerCase());
}

/**
 * Vérifie si le navigateur supporte WebP
 */
export function supportsWebP() {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
}

/**
 * Convertit un fichier en WebP avec optimisation
 */
export async function convertToWebP(file, options = {}) {
  if (!file) throw new Error('Fichier requis');
  if (!isSupportedImageFormat(file)) {
    throw new Error(`Format non supporté: ${file.type}`);
  }

  const config = {
    quality: options.quality || IMAGE_CONFIG.QUALITY,
    maxSizeMB: options.maxSizeMB || IMAGE_CONFIG.MAX_SIZE_MB,
    maxWidthOrHeight: options.maxWidth || IMAGE_CONFIG.MAX_WIDTH,
    useWebWorker: true,
    preserveExif: false,
    ...options
  };

  try {
    // Première compression
    const compressedFile = await imageCompression(file, {
      ...config,
      fileType: 'image/webp'
    });

    // Validation du résultat
    if (compressedFile.size > config.maxSizeMB * 1024 * 1024) {
      // Compression plus agressive si nécessaire
      const ultraCompressed = await imageCompression(file, {
        ...config,
        quality: config.quality * 0.8,
        maxSizeMB: config.maxSizeMB * 0.8,
        fileType: 'image/webp'
      });
      
      return {
        file: ultraCompressed,
        originalSize: file.size,
        compressedSize: ultraCompressed.size,
        compressionRatio: ((file.size - ultraCompressed.size) / file.size * 100).toFixed(1),
        format: 'webp'
      };
    }

    return {
      file: compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size,
      compressionRatio: ((file.size - compressedFile.size) / file.size * 100).toFixed(1),
      format: 'webp'
    };

  } catch (error) {
    console.error('Erreur de conversion WebP:', error);
    throw new Error(`Échec de conversion: ${error.message}`);
  }
}

/**
 * Génère plusieurs tailles d'une image pour le responsive
 */
export async function generateResponsiveSizes(file, sizes = IMAGE_CONFIG.RESPONSIVE_SIZES) {
  if (!file) throw new Error('Fichier requis');

  const results = [];
  
  for (const size of sizes) {
    try {
      const resized = await imageCompression(file, {
        maxWidthOrHeight: size,
        quality: IMAGE_CONFIG.QUALITY,
        fileType: 'image/webp',
        useWebWorker: true
      });

      results.push({
        size,
        file: resized,
        width: size,
        url: URL.createObjectURL(resized)
      });
    } catch (error) {
      console.warn(`Erreur génération taille ${size}px:`, error);
    }
  }

  return results;
}

/**
 * Crée un aperçu de l'image optimisée
 */
export function createImagePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          src: e.target.result,
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight,
          size: file.size,
          name: file.name
        });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Valide les dimensions et la taille d'une image
 */
export function validateImage(file, constraints = {}) {
  const errors = [];
  
  const {
    maxSizeMB = IMAGE_CONFIG.MAX_SIZE_MB,
    maxWidth = IMAGE_CONFIG.MAX_WIDTH,
    maxHeight = IMAGE_CONFIG.MAX_HEIGHT,
    minWidth = 50,
    minHeight = 50,
    allowedFormats = IMAGE_CONFIG.SUPPORTED_FORMATS
  } = constraints;

  // Vérification du format
  if (!allowedFormats.includes(file.type)) {
    errors.push(`Format non autorisé. Formats acceptés: ${allowedFormats.join(', ')}`);
  }

  // Vérification de la taille
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    errors.push(`Taille trop importante: ${sizeMB.toFixed(1)}MB (max: ${maxSizeMB}MB)`);
  }

  return new Promise((resolve) => {
    if (errors.length > 0) {
      resolve({ valid: false, errors });
      return;
    }

    // Vérification des dimensions (nécessite le chargement de l'image)
    const img = new Image();
    img.onload = () => {
      const dimensionErrors = [];

      if (img.naturalWidth > maxWidth) {
        dimensionErrors.push(`Largeur trop importante: ${img.naturalWidth}px (max: ${maxWidth}px)`);
      }
      if (img.naturalHeight > maxHeight) {
        dimensionErrors.push(`Hauteur trop importante: ${img.naturalHeight}px (max: ${maxHeight}px)`);
      }
      if (img.naturalWidth < minWidth) {
        dimensionErrors.push(`Largeur insuffisante: ${img.naturalWidth}px (min: ${minWidth}px)`);
      }
      if (img.naturalHeight < minHeight) {
        dimensionErrors.push(`Hauteur insuffisante: ${img.naturalHeight}px (min: ${minHeight}px)`);
      }

      resolve({
        valid: dimensionErrors.length === 0,
        errors: dimensionErrors,
        dimensions: {
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight
        }
      });
    };

    img.onerror = () => {
      resolve({
        valid: false,
        errors: ['Image corrompue ou illisible']
      });
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Optimise une image selon le niveau choisi
 */
export async function optimizeImage(file, level = 'medium') {
  const config = IMAGE_CONFIG.OPTIMIZATION_LEVELS[level];
  if (!config) {
    throw new Error(`Niveau d'optimisation invalide: ${level}`);
  }

  return convertToWebP(file, config);
}

/**
 * Calcule les métadonnées d'une image
 */
export function getImageMetadata(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight,
          megapixels: (img.naturalWidth * img.naturalHeight / 1000000).toFixed(1)
        });
      };
      img.onerror = () => reject(new Error('Impossible de lire les métadonnées'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsDataURL(file);
  });
}

/**
 * Convertit les bytes en format lisible
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Génère un nom de fichier unique pour éviter les conflits
 */
export function generateUniqueFileName(originalName, suffix = '') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  
  return `${baseName}${suffix}_${timestamp}_${random}.${extension}`;
}

export default {
  convertToWebP,
  generateResponsiveSizes,
  createImagePreview,
  validateImage,
  optimizeImage,
  getImageMetadata,
  formatFileSize,
  generateUniqueFileName,
  isSupportedImageFormat,
  supportsWebP,
  IMAGE_CONFIG
};