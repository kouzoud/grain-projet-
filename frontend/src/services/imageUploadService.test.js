/**
 * Tests unitaires pour imageUploadService
 */

// Mock des dépendances
const mockAxios = {
  create: jest.fn(() => ({
    post: jest.fn(),
    delete: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  })),
  put: jest.fn()
};

// Mock de browser-image-compression pour les tests
jest.mock('browser-image-compression', () => {
  return jest.fn().mockResolvedValue(new File([''], 'test.webp', { type: 'image/webp' }));
});

jest.mock('axios', () => mockAxios);

// Import du service après les mocks
import imageUploadService, { ImageUploadService } from '../imageUploadService.js';

describe('ImageUploadService', () => {
  let service;
  let mockFile;

  beforeEach(() => {
    service = new ImageUploadService();
    mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize with default values', () => {
      expect(service.maxRetries).toBe(3);
      expect(service.retryDelay).toBe(1000);
      expect(service.baseURL).toBe('');
    });

    test('should use environment variable for baseURL', () => {
      const originalEnv = process.env.REACT_APP_API_BASE_URL;
      process.env.REACT_APP_API_BASE_URL = 'https://api.test.com';
      
      const newService = new ImageUploadService();
      expect(newService.baseURL).toBe('https://api.test.com');
      
      process.env.REACT_APP_API_BASE_URL = originalEnv;
    });
  });

  describe('getAuthToken', () => {
    test('should return token from localStorage', () => {
      const mockToken = 'test-token';
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(mockToken);
      
      const token = service.getAuthToken();
      expect(token).toBe(mockToken);
      expect(localStorage.getItem).toHaveBeenCalledWith('authToken');
    });

    test('should fallback to sessionStorage', () => {
      jest.spyOn(Storage.prototype, 'getItem')
        .mockImplementationOnce(() => null) // localStorage
        .mockImplementationOnce(() => 'session-token'); // sessionStorage
      
      const token = service.getAuthToken();
      expect(token).toBe('session-token');
    });
  });

  describe('formatError', () => {
    test('should format timeout error', () => {
      const error = { code: 'ECONNABORTED' };
      const formattedError = service.formatError(error);
      expect(formattedError.message).toContain('Timeout');
    });

    test('should format 413 error', () => {
      const error = { response: { status: 413 } };
      const formattedError = service.formatError(error);
      expect(formattedError.message).toContain('trop volumineux');
    });

    test('should format 415 error', () => {
      const error = { response: { status: 415 } };
      const formattedError = service.formatError(error);
      expect(formattedError.message).toContain('non supporté');
    });

    test('should format 401 error', () => {
      const error = { response: { status: 401 } };
      const formattedError = service.formatError(error);
      expect(formattedError.message).toContain('Non autorisé');
    });

    test('should format server error', () => {
      const error = { response: { status: 500 } };
      const formattedError = service.formatError(error);
      expect(formattedError.message).toContain('Erreur serveur');
    });

    test('should format custom error message', () => {
      const error = { response: { data: { message: 'Custom error' } } };
      const formattedError = service.formatError(error);
      expect(formattedError.message).toBe('Custom error');
    });
  });

  describe('delay', () => {
    test('should resolve after specified time', async () => {
      const start = Date.now();
      await service.delay(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(90); // Permet une petite marge d'erreur
    });
  });

  describe('uploadSingleFile', () => {
    test('should upload file successfully', async () => {
      const mockResponse = { data: { id: 1, url: 'http://test.com/image.jpg' } };
      service.client.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.uploadSingleFile(mockFile);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(result.file.name).toBe('test.jpg');
    });

    test('should retry on failure', async () => {
      service.client.post = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: { id: 1 } });

      const result = await service.uploadSingleFile(mockFile, { retries: 1 });

      expect(service.client.post).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
      expect(result.attempt).toBe(2);
    });

    test('should not retry for 401 errors', async () => {
      const error = { response: { status: 401 } };
      service.client.post = jest.fn().mockRejectedValue(error);

      await expect(service.uploadSingleFile(mockFile)).rejects.toThrow();
      expect(service.client.post).toHaveBeenCalledTimes(1);
    });

    test('should call onProgress callback', async () => {
      const onProgress = jest.fn();
      service.client.post = jest.fn().mockImplementation((url, data, config) => {
        // Simuler le progrès
        config.onUploadProgress({ loaded: 50, total: 100 });
        return Promise.resolve({ data: { id: 1 } });
      });

      await service.uploadSingleFile(mockFile, { onProgress });

      expect(onProgress).toHaveBeenCalledWith(50);
    });
  });

  describe('uploadMultipleFiles', () => {
    test('should upload multiple files successfully', async () => {
      const files = [mockFile, mockFile];
      service.uploadSingleFile = jest.fn().mockResolvedValue({ 
        success: true, 
        data: { id: 1 } 
      });

      const result = await service.uploadMultipleFiles(files);

      expect(result.success).toBe(true);
      expect(result.completed).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.total).toBe(2);
    });

    test('should handle mixed success and failure', async () => {
      const files = [mockFile, mockFile];
      service.uploadSingleFile = jest.fn()
        .mockResolvedValueOnce({ success: true, data: { id: 1 } })
        .mockRejectedValueOnce(new Error('Upload failed'));

      const result = await service.uploadMultipleFiles(files);

      expect(result.success).toBe(false);
      expect(result.completed).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.total).toBe(2);
    });

    test('should call progress callback', async () => {
      const onProgress = jest.fn();
      const files = [mockFile];
      service.uploadSingleFile = jest.fn().mockResolvedValue({ 
        success: true, 
        data: { id: 1 } 
      });

      await service.uploadMultipleFiles(files, { onProgress });

      expect(onProgress).toHaveBeenCalled();
    });
  });

  describe('uploadAvatar', () => {
    test('should call uploadSingleFile with correct parameters', async () => {
      service.uploadSingleFile = jest.fn().mockResolvedValue({ success: true });

      await service.uploadAvatar(mockFile, { sizes: [32, 64] });

      expect(service.uploadSingleFile).toHaveBeenCalledWith(mockFile, {
        endpoint: '/api/upload/avatar',
        additionalData: {
          sizes: '32,64',
          quality: 0.9,
          type: 'avatar'
        }
      });
    });
  });

  describe('uploadGalleryImages', () => {
    test('should call uploadMultipleFiles with correct parameters', async () => {
      service.uploadMultipleFiles = jest.fn().mockResolvedValue({ success: true });

      await service.uploadGalleryImages([mockFile], { thumbnailSizes: [200, 400] });

      expect(service.uploadMultipleFiles).toHaveBeenCalledWith([mockFile], {
        endpoint: '/api/upload/gallery',
        additionalData: {
          generateThumbnails: true,
          thumbnailSizes: '200,400',
          watermark: false,
          type: 'gallery'
        }
      });
    });
  });

  describe('deleteImage', () => {
    test('should delete image successfully', async () => {
      const mockResponse = { data: { success: true } };
      service.client.delete = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.deleteImage('123');

      expect(result.success).toBe(true);
      expect(service.client.delete).toHaveBeenCalledWith('/api/upload/123', {
        params: { deleteVariants: true }
      });
    });
  });

  describe('getImageInfo', () => {
    test('should get image info successfully', async () => {
      const mockResponse = { data: { id: '123', url: 'http://test.com/image.jpg' } };
      service.client.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.getImageInfo('123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
    });
  });

  describe('revokeObjectUrls', () => {
    test('should revoke single URL', () => {
      const mockRevokeObjectURL = jest.fn();
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      ImageUploadService.revokeObjectUrls('blob:http://localhost/123');

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/123');
    });

    test('should revoke multiple URLs', () => {
      const mockRevokeObjectURL = jest.fn();
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      const urls = ['blob:http://localhost/123', 'blob:http://localhost/456'];
      ImageUploadService.revokeObjectUrls(urls);

      expect(mockRevokeObjectURL).toHaveBeenCalledTimes(2);
    });

    test('should ignore non-blob URLs', () => {
      const mockRevokeObjectURL = jest.fn();
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      ImageUploadService.revokeObjectUrls('http://localhost/image.jpg');

      expect(mockRevokeObjectURL).not.toHaveBeenCalled();
    });
  });
});

describe('Singleton instance', () => {
  test('should export singleton instance', () => {
    expect(imageUploadService).toBeInstanceOf(ImageUploadService);
  });
});