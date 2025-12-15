/**
 * Hook personnalisé pour l'upload et la conversion d'images WebP
 */
import { useState, useCallback, useRef } from 'react';
import { convertToWebP, validateImage, createImagePreview, formatFileSize } from '../utils/imageConverter';

export const useImageUpload = (options = {}) => {
  const {
    maxFiles = 5,
    maxSizeMB = 5,
    quality = 0.85,
    autoConvert = true,
    onUploadStart = () => {},
    onUploadProgress = () => {},
    onUploadComplete = () => {},
    onUploadError = () => {},
    optimizationLevel = 'medium'
  } = options;

  // États
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  const [previews, setPreviews] = useState([]);
  
  // Références
  const fileInputRef = useRef(null);
  const uploadAbortController = useRef(null);

  /**
   * Ajoute des fichiers à la liste
   */
  const addFiles = useCallback(async (newFiles) => {
    const fileArray = Array.from(newFiles);
    const validFiles = [];
    const newErrors = [];

    // Vérifier la limite de fichiers
    if (files.length + fileArray.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} fichiers autorisés`);
      setErrors(prev => [...prev, ...newErrors]);
      return;
    }

    // Traiter chaque fichier
    for (const file of fileArray) {
      try {
        // Validation
        const validation = await validateImage(file, { maxSizeMB });
        
        if (validation.valid) {
          // Créer un aperçu
          const preview = await createImagePreview(file);
          
          // Convertir en WebP si nécessaire
          let processedFile = file;
          let conversionInfo = null;
          
          if (autoConvert && file.type !== 'image/webp') {
            const converted = await convertToWebP(file, { quality, maxSizeMB });
            processedFile = converted.file;
            conversionInfo = converted;
          }

          const fileData = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
            original: file,
            processed: processedFile,
            preview,
            conversionInfo,
            uploadProgress: 0,
            uploaded: false,
            error: null
          };

          validFiles.push(fileData);
        } else {
          newErrors.push(`${file.name}: ${validation.errors.join(', ')}`);
        }
      } catch (error) {
        newErrors.push(`${file.name}: Erreur de traitement - ${error.message}`);
      }
    }

    // Mettre à jour les états
    setFiles(prev => [...prev, ...validFiles]);
    setErrors(prev => [...prev, ...newErrors]);

    // Générer les aperçus
    const newPreviews = validFiles.map(fileData => ({
      id: fileData.id,
      src: fileData.preview.src,
      name: fileData.processed.name,
      size: formatFileSize(fileData.processed.size),
      dimensions: `${fileData.preview.width}×${fileData.preview.height}`,
      conversion: fileData.conversionInfo
    }));

    setPreviews(prev => [...prev, ...newPreviews]);
  }, [files.length, maxFiles, maxSizeMB, quality, autoConvert]);

  /**
   * Supprime un fichier de la liste
   */
  const removeFile = useCallback((fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setPreviews(prev => prev.filter(p => p.id !== fileId));
    setErrors(prev => prev.filter(error => !error.includes(fileId)));
  }, []);

  /**
   * Vide la liste des fichiers
   */
  const clearFiles = useCallback(() => {
    // Nettoyer les URLs d'objets pour éviter les fuites mémoire
    previews.forEach(preview => {
      if (preview.src.startsWith('blob:')) {
        URL.revokeObjectURL(preview.src);
      }
    });

    setFiles([]);
    setPreviews([]);
    setErrors([]);
    setProgress(0);
  }, [previews]);

  /**
   * Upload les fichiers vers le serveur
   */
  const uploadFiles = useCallback(async (uploadUrl, additionalData = {}) => {
    if (files.length === 0) return [];

    setUploading(true);
    setProgress(0);
    onUploadStart();

    // Créer un contrôleur d'annulation
    uploadAbortController.current = new AbortController();

    const uploadedFiles = [];
    const uploadErrors = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        
        try {
          // Créer FormData
          const formData = new FormData();
          formData.append('file', fileData.processed);
          
          // Ajouter données additionnelles
          Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value);
          });

          // Upload avec progression
          const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            signal: uploadAbortController.current.signal
          });

          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }

          const result = await response.json();
          
          // Marquer comme uploadé
          fileData.uploaded = true;
          fileData.uploadResult = result;
          uploadedFiles.push(result);

          // Mettre à jour la progression
          const progressPercent = ((i + 1) / files.length) * 100;
          setProgress(progressPercent);
          onUploadProgress(progressPercent, i + 1, files.length);

        } catch (error) {
          if (error.name === 'AbortError') {
            throw error; // Propagation de l'annulation
          }
          
          const errorMsg = `${fileData.original.name}: ${error.message}`;
          uploadErrors.push(errorMsg);
          fileData.error = error.message;
        }
      }

      // Finalisation
      setUploading(false);
      
      if (uploadErrors.length > 0) {
        setErrors(prev => [...prev, ...uploadErrors]);
        onUploadError(uploadErrors);
      } else {
        onUploadComplete(uploadedFiles);
      }

      return uploadedFiles;

    } catch (error) {
      setUploading(false);
      setProgress(0);
      
      if (error.name === 'AbortError') {
        console.log('Upload annulé');
        return [];
      }
      
      const errorMsg = `Erreur générale d'upload: ${error.message}`;
      setErrors(prev => [...prev, errorMsg]);
      onUploadError([errorMsg]);
      throw error;
    }
  }, [files, onUploadStart, onUploadProgress, onUploadComplete, onUploadError]);

  /**
   * Annule l'upload en cours
   */
  const cancelUpload = useCallback(() => {
    if (uploadAbortController.current) {
      uploadAbortController.current.abort();
    }
    setUploading(false);
    setProgress(0);
  }, []);

  /**
   * Ouvre le sélecteur de fichiers
   */
  const openFileSelector = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  /**
   * Gestionnaire pour le changement de fichier
   */
  const handleFileInputChange = useCallback((event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // Reset l'input pour permettre de sélectionner le même fichier
    event.target.value = '';
  }, [addFiles]);

  /**
   * Gestionnaire pour le drag & drop
   */
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [addFiles]);

  /**
   * Gestionnaires pour les événements de drag
   */
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleDragEnter = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
  }, []);

  /**
   * Efface les erreurs
   */
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  /**
   * Statistiques globales
   */
  const stats = {
    totalFiles: files.length,
    totalSize: files.reduce((acc, f) => acc + f.processed.size, 0),
    formattedTotalSize: formatFileSize(files.reduce((acc, f) => acc + f.processed.size, 0)),
    uploadedCount: files.filter(f => f.uploaded).length,
    errorCount: files.filter(f => f.error).length,
    conversionSavings: files.reduce((acc, f) => {
      if (f.conversionInfo) {
        return acc + (f.original.size - f.processed.size);
      }
      return acc;
    }, 0)
  };

  // Nettoyage à la fermeture du composant
  const cleanup = useCallback(() => {
    previews.forEach(preview => {
      if (preview.src.startsWith('blob:')) {
        URL.revokeObjectURL(preview.src);
      }
    });
    
    if (uploadAbortController.current) {
      uploadAbortController.current.abort();
    }
  }, [previews]);

  return {
    // État
    files,
    previews,
    uploading,
    progress,
    errors,
    stats,
    
    // Actions
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    cancelUpload,
    openFileSelector,
    clearErrors,
    cleanup,
    
    // Gestionnaires d'événements
    handleFileInputChange,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    
    // Références
    fileInputRef
  };
};