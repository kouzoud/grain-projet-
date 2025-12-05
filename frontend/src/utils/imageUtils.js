const API_BASE_URL = 'http://localhost:8080';

export const getSingleImageUrl = (filename) => {
    if (!filename) return null;
    
    // Si c'est déjà une URL complète, la retourner
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
        return filename;
    }
    
    // Nettoyer le nom de fichier (enlever les espaces en début/fin)
    const cleanFilename = filename.trim();
    
    // Construire l'URL sans double encodage
    return `${API_BASE_URL}/api/uploads/${cleanFilename}`;
};

export const getImageUrl = (request) => {
    if (!request) return null;

    // 1. Récupérer le nom du fichier
    let filename = null;
    if (request.existingPhotos && Array.isArray(request.existingPhotos) && request.existingPhotos.length > 0) {
        filename = request.existingPhotos[0];
    } else if (request.photosUrl && Array.isArray(request.photosUrl) && request.photosUrl.length > 0) {
        filename = request.photosUrl[0];
    } else if (typeof request.photosUrl === 'string') {
        filename = request.photosUrl;
    } else if (request.photoUrl) {
        // Fallback for potential naming mismatch
        filename = request.photoUrl;
    } else if (Array.isArray(request.photos) && request.photos.length > 0) {
        // Fallback for 'photos' vs 'photosUrl'
        filename = request.photos[0];
    }

    return getSingleImageUrl(filename);
};

export const defaultImage = "https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
