/**
 * Service d'upload d'images avec gestion des erreurs et retry automatique
 */
import axios from 'axios';

class ImageUploadService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || '';
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 seconde
    
    // Configuration axios par défaut
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 secondes
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // Interceptor pour ajouter le token d'authentification
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor pour gérer les réponses d'erreur
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Erreur upload:', error.response?.data || error.message);
        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * Récupère le token d'authentification
   */
  getAuthToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  /**
   * Formate les erreurs pour un affichage uniforme
   */
  formatError(error) {
    if (error.code === 'ECONNABORTED') {
      return new Error('Timeout: L\'upload a pris trop de temps');
    }
    
    if (error.response?.status === 413) {
      return new Error('Fichier trop volumineux pour le serveur');
    }
    
    if (error.response?.status === 415) {
      return new Error('Format de fichier non supporté par le serveur');
    }
    
    if (error.response?.status === 401) {
      return new Error('Non autorisé: Veuillez vous reconnecter');
    }
    
    if (error.response?.status >= 500) {
      return new Error('Erreur serveur: Veuillez réessayer plus tard');
    }

    return error.response?.data?.message 
      ? new Error(error.response.data.message)
      : new Error('Erreur d\'upload inconnue');
  }

  /**
   * Délai d'attente avec promesse
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Upload d'un seul fichier avec retry automatique
   */
  async uploadSingleFile(file, options = {}) {
    const {
      endpoint = '/api/upload',
      additionalData = {},
      onProgress = () => {},
      signal = null,
      retries = this.maxRetries
    } = options;

    const formData = new FormData();
    formData.append('file', file);
    
    // Ajouter les données supplémentaires
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const config = {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      },
      signal
    };

    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.client.post(endpoint, formData, config);
        
        return {
          success: true,
          data: response.data,
          file: {
            name: file.name,
            size: file.size,
            type: file.type
          },
          attempt: attempt + 1
        };
        
      } catch (error) {
        lastError = error;
        
        // Ne pas retry pour certaines erreurs
        if (error.response?.status === 401 || 
            error.response?.status === 413 || 
            error.response?.status === 415 ||
            error.name === 'AbortError') {
          throw error;
        }
        
        // Attendre avant le retry (sauf sur la dernière tentative)
        if (attempt < retries) {
          await this.delay(this.retryDelay * (attempt + 1));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Upload de plusieurs fichiers avec contrôle de concurrence
   */
  async uploadMultipleFiles(files, options = {}) {
    const {
      endpoint = '/api/upload',
      additionalData = {},
      onProgress = () => {},
      onFileComplete = () => {},
      onFileError = () => {},
      signal = null,
      maxConcurrency = 3
    } = options;

    const results = [];
    const errors = [];
    let completed = 0;
    const fileProgressMap = {}; // Déplacer hors de la fonction pour la persistance

    // Fonction pour traiter un fichier
    const processFile = async (file, index) => {
      try {
        const result = await this.uploadSingleFile(file, {
          endpoint,
          additionalData,
          signal,
          onProgress: (progress) => {
            fileProgressMap[index] = progress;
            
            // Calculer le progrès global
            const totalProgress = Object.values(fileProgressMap)
              .reduce((sum, p) => sum + p, 0);
            const overallProgress = totalProgress / files.length;
            
            onProgress(Math.round(overallProgress), index, files.length);
          }
        });

        results[index] = result;
        completed++;
        onFileComplete(result, index, completed, files.length);
        
        return result;
        
      } catch (error) {
        const errorInfo = {
          file: file.name,
          index,
          error: error.message,
          originalError: error
        };
        
        errors.push(errorInfo);
        completed++;
        onFileError(errorInfo, index, completed, files.length);
        
        return { success: false, error: errorInfo };
      }
    };

    // Upload avec contrôle de concurrence
    const batches = [];
    for (let i = 0; i < files.length; i += maxConcurrency) {
      const batch = files.slice(i, i + maxConcurrency)
        .map((file, batchIndex) => processFile(file, i + batchIndex));
      batches.push(batch);
    }

    // Traiter chaque batch séquentiellement
    for (const batch of batches) {
      await Promise.all(batch);
    }

    return {
      success: errors.length === 0,
      results: results.filter(Boolean),
      errors,
      completed: results.filter(r => r && r.success).length,
      failed: errors.length,
      total: files.length
    };
  }

  /**
   * Upload d'avatar avec redimensionnement côté serveur
   */
  async uploadAvatar(file, options = {}) {
    const {
      sizes = [32, 48, 64, 96, 128, 256],
      quality = 0.9,
      ...otherOptions
    } = options;

    return this.uploadSingleFile(file, {
      endpoint: '/api/upload/avatar',
      additionalData: {
        sizes: sizes.join(','),
        quality,
        type: 'avatar'
      },
      ...otherOptions
    });
  }

  /**
   * Upload d'images de galerie avec génération de thumbnails
   */
  async uploadGalleryImages(files, options = {}) {
    const {
      generateThumbnails = true,
      thumbnailSizes = [200, 400, 800],
      watermark = false,
      ...otherOptions
    } = options;

    return this.uploadMultipleFiles(files, {
      endpoint: '/api/upload/gallery',
      additionalData: {
        generateThumbnails,
        thumbnailSizes: thumbnailSizes.join(','),
        watermark,
        type: 'gallery'
      },
      ...otherOptions
    });
  }

  /**
   * Suppression d'une image uploadée
   */
  async deleteImage(imageId, options = {}) {
    const {
      endpoint = `/api/upload/${imageId}`,
      deleteVariants = true
    } = options;

    try {
      const response = await this.client.delete(endpoint, {
        params: { deleteVariants }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Récupération des informations d'une image
   */
  async getImageInfo(imageId, options = {}) {
    const { endpoint = `/api/upload/info/${imageId}` } = options;

    try {
      const response = await this.client.get(endpoint);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Génération d'URL signée pour upload direct
   */
  async getSignedUploadUrl(filename, contentType, options = {}) {
    const {
      endpoint = '/api/upload/signed-url',
      expiresIn = 3600 // 1 heure
    } = options;

    try {
      const response = await this.client.post(endpoint, {
        filename,
        contentType,
        expiresIn
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Upload direct vers URL signée (AWS S3, Google Cloud, etc.)
   */
  async uploadToSignedUrl(file, signedUrl, options = {}) {
    const { onProgress = () => {} } = options;

    try {
      const response = await axios.put(signedUrl, file, {
        headers: {
          'Content-Type': file.type
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      });

      return {
        success: true,
        data: response.data,
        url: signedUrl.split('?')[0] // URL finale sans les paramètres de signature
      };
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Validation d'image côté serveur
   */
  async validateImage(file, options = {}) {
    const {
      endpoint = '/api/upload/validate',
      checkDimensions = true,
      checkContent = true
    } = options;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('checkDimensions', checkDimensions);
    formData.append('checkContent', checkContent);

    try {
      const response = await this.client.post(endpoint, formData);
      
      return {
        valid: true,
        data: response.data
      };
    } catch (error) {
      if (error.response?.status === 400) {
        return {
          valid: false,
          errors: error.response.data.errors || ['Image invalide']
        };
      }
      throw this.formatError(error);
    }
  }

  /**
   * Nettoyage des URLs d'objets pour éviter les fuites mémoire
   */
  static revokeObjectUrls(urls) {
    if (Array.isArray(urls)) {
      urls.forEach(url => {
        if (typeof url === 'string' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    } else if (typeof urls === 'string' && urls.startsWith('blob:')) {
      URL.revokeObjectURL(urls);
    }
  }
}

// Instance singleton
const imageUploadService = new ImageUploadService();

export default imageUploadService;
export { ImageUploadService };