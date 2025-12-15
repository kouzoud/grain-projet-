/**
 * Composant ImageUploader - Interface complète d'upload d'images avec optimisation WebP
 */
import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Download,
  Eye,
  Trash2,
  RotateCcw,
  Settings
} from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';
import { formatFileSize } from '../utils/imageConverter';

const ImageUploader = ({
  // Configuration upload
  uploadUrl = '/api/upload',
  maxFiles = 5,
  maxSizeMB = 5,
  quality = 0.85,
  
  // Options d'affichage
  showPreviews = true,
  showProgress = true,
  showStats = true,
  compact = false,
  
  // Callbacks
  onUploadComplete = () => {},
  onUploadError = () => {},
  onFileRemove = () => {},
  
  // Style personnalisé
  className = '',
  dropZoneClassName = '',
  
  // Données additionnelles à envoyer
  additionalData = {},
  
  // Configuration avancée
  autoUpload = false,
  showOptimizationSettings = false,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  
  ...props
}) => {
  // États locaux
  const [optimizationLevel, setOptimizationLevel] = useState('medium');
  const [dragActive, setDragActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Hook d'upload personnalisé
  const {
    files,
    previews,
    uploading,
    progress,
    errors,
    stats,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    cancelUpload,
    openFileSelector,
    clearErrors,
    handleFileInputChange,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    fileInputRef
  } = useImageUpload({
    maxFiles,
    maxSizeMB,
    quality,
    optimizationLevel,
    onUploadComplete,
    onUploadError: (uploadErrors) => {
      onUploadError(uploadErrors);
    }
  });

  /**
   * Gestion du drag & drop amélioré
   */
  const handleEnhancedDragEnter = useCallback((e) => {
    handleDragEnter(e);
    setDragActive(true);
  }, [handleDragEnter]);

  const handleEnhancedDragLeave = useCallback((e) => {
    handleDragLeave(e);
    // Ne désactiver que si on sort vraiment de la zone
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragActive(false);
    }
  }, [handleDragLeave]);

  const handleEnhancedDrop = useCallback((e) => {
    handleDrop(e);
    setDragActive(false);
  }, [handleDrop]);

  /**
   * Démarrer l'upload manuel
   */
  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;
    
    try {
      await uploadFiles(uploadUrl, additionalData);
    } catch (error) {
      console.error('Erreur d\'upload:', error);
    }
  }, [files.length, uploadFiles, uploadUrl, additionalData]);

  /**
   * Supprimer un fichier spécifique
   */
  const handleRemoveFile = useCallback((fileId) => {
    removeFile(fileId);
    onFileRemove(fileId);
  }, [removeFile, onFileRemove]);

  /**
   * Aperçu d'un fichier
   */
  const handlePreviewFile = useCallback((preview) => {
    // Ouvrir dans une nouvelle fenêtre ou modal
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head><title>Aperçu - ${preview.name}</title></head>
        <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
          <img src="${preview.src}" style="max-width:100%;max-height:100vh;object-fit:contain;" alt="${preview.name}" />
        </body>
      </html>
    `);
  }, []);

  /**
   * Composant de statistiques
   */
  const StatsDisplay = () => {
    if (!showStats || stats.totalFiles === 0) return null;

    return (
      <div className="bg-gray-50 rounded-lg p-4 text-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-gray-500">Fichiers</div>
            <div className="font-semibold">{stats.totalFiles}</div>
          </div>
          <div>
            <div className="text-gray-500">Taille totale</div>
            <div className="font-semibold">{stats.formattedTotalSize}</div>
          </div>
          <div>
            <div className="text-gray-500">Uploadés</div>
            <div className="font-semibold text-green-600">{stats.uploadedCount}</div>
          </div>
          {stats.conversionSavings > 0 && (
            <div>
              <div className="text-gray-500">Économisé</div>
              <div className="font-semibold text-blue-600">
                {formatFileSize(stats.conversionSavings)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Composant de prévisualisation des fichiers
   */
  const FilePreview = ({ preview, file }) => {
    const hasError = file.error;
    const isUploaded = file.uploaded;
    const isUploading = uploading;

    return (
      <div className={`relative bg-white rounded-lg border-2 overflow-hidden ${
        hasError ? 'border-red-200' : isUploaded ? 'border-green-200' : 'border-gray-200'
      }`}>
        {/* Image de prévisualisation */}
        <div className="aspect-square relative">
          <img
            src={preview.src}
            alt={preview.name}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay de statut */}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="flex gap-2">
              <button
                onClick={() => handlePreviewFile(preview)}
                className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                title="Aperçu"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleRemoveFile(preview.id)}
                className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                title="Supprimer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          
          {/* Indicateur de statut */}
          <div className="absolute top-2 right-2">
            {hasError && <AlertCircle className="w-5 h-5 text-red-500" />}
            {isUploaded && <CheckCircle className="w-5 h-5 text-green-500" />}
            {isUploading && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
          </div>
        </div>

        {/* Informations du fichier */}
        <div className="p-3">
          <div className="text-sm font-medium truncate" title={preview.name}>
            {preview.name}
          </div>
          <div className="text-xs text-gray-500 mt-1 flex justify-between">
            <span>{preview.size}</span>
            <span>{preview.dimensions}</span>
          </div>
          
          {/* Info de conversion */}
          {preview.conversion && (
            <div className="text-xs text-blue-600 mt-1">
              ↓ {preview.conversion.compressionRatio}% optimisé
            </div>
          )}
          
          {/* Erreur */}
          {hasError && (
            <div className="text-xs text-red-600 mt-2">
              {file.error}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Zone de drop */}
      <div
        className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${dropZoneClassName}`}
        onDrop={handleEnhancedDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleEnhancedDragEnter}
        onDragLeave={handleEnhancedDragLeave}
      >
        <div className={`p-8 text-center ${compact ? 'p-4' : ''}`}>
          <div className="flex flex-col items-center">
            <Upload className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} text-gray-400 mb-4`} />
            
            <div className="text-lg font-medium text-gray-900 mb-2">
              {dragActive ? 'Déposez vos images ici' : 'Uploadez vos images'}
            </div>
            
            <div className="text-sm text-gray-500 mb-4">
              Glissez-déposez ou{' '}
              <button
                onClick={openFileSelector}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                parcourez vos fichiers
              </button>
            </div>
            
            <div className="text-xs text-gray-400">
              {allowedTypes.map(type => type.split('/')[1]).join(', ').toUpperCase()} • 
              Max {maxSizeMB}MB • {maxFiles} fichiers max
            </div>
          </div>
        </div>

        {/* Indicateur de drag actif */}
        {dragActive && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg pointer-events-none" />
        )}
      </div>

      {/* Statistiques */}
      {!compact && <StatsDisplay />}

      {/* Barre de progression globale */}
      {showProgress && uploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Upload en cours...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Erreurs */}
      {errors.length > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="font-medium text-red-800">Erreurs détectées</span>
            </div>
            <button
              onClick={clearErrors}
              className="text-red-600 hover:text-red-800"
            >
              <X size={16} />
            </button>
          </div>
          <ul className="text-sm text-red-700">
            {errors.map((error, index) => (
              <li key={index} className="mb-1">• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Aperçus des fichiers */}
      {showPreviews && previews.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Images sélectionnées</h3>
            <div className="flex gap-2">
              {showOptimizationSettings && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                >
                  <Settings size={16} />
                  Paramètres
                </button>
              )}
              <button
                onClick={clearFiles}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                <Trash2 size={16} />
                Tout supprimer
              </button>
            </div>
          </div>

          {/* Paramètres d'optimisation */}
          {showSettings && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Niveau d'optimisation:</label>
                <select
                  value={optimizationLevel}
                  onChange={(e) => setOptimizationLevel(e.target.value)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="low">Faible (90% qualité)</option>
                  <option value="medium">Moyen (85% qualité)</option>
                  <option value="high">Élevé (75% qualité)</option>
                  <option value="ultra">Ultra (65% qualité)</option>
                </select>
              </div>
            </div>
          )}

          <div className={`grid gap-4 ${
            compact 
              ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {previews.map((preview, index) => (
              <FilePreview
                key={preview.id}
                preview={preview}
                file={files[index]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      {files.length > 0 && !autoUpload && (
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={cancelUpload}
            disabled={!uploading}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {uploading ? 'Annuler' : 'Réinitialiser'}
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || stats.totalFiles === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Upload...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Uploader ({stats.totalFiles})
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;