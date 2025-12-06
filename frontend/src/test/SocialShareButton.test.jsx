import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SocialShareButton from '../../components/common/SocialShareButton';
import { toast } from 'react-hot-toast';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('SocialShareButton', () => {
  const mockProps = {
    title: 'Aide Urgente',
    description: 'Une famille dans le besoin à Casablanca',
    caseId: 123,
    ville: 'Casablanca',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    delete window.navigator.share;
    delete window.navigator.clipboard;
  });

  it('devrait afficher le bouton de partage', () => {
    render(<SocialShareButton {...mockProps} />);
    const button = screen.getByRole('button', { name: /partager cette demande/i });
    expect(button).toBeInTheDocument();
  });

  it('devrait afficher le label quand showLabel est true', () => {
    render(<SocialShareButton {...mockProps} showLabel={true} />);
    expect(screen.getByText('Partager')).toBeInTheDocument();
  });

  it('devrait utiliser navigator.share sur mobile', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    window.navigator.share = mockShare;

    render(<SocialShareButton {...mockProps} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: expect.stringContaining('Aide Urgente'),
        text: expect.stringContaining('Casablanca'),
        url: expect.stringContaining('caseId=123'),
      });
    });

    expect(toast.success).toHaveBeenCalled();
  });

  it('devrait copier dans le presse-papier sur desktop', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    window.navigator.clipboard = { writeText: mockWriteText };

    render(<SocialShareButton {...mockProps} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining('Aide Urgente')
      );
    });

    expect(toast.success).toHaveBeenCalled();
  });

  it('devrait gérer les erreurs de partage', async () => {
    const mockShare = vi.fn().mockRejectedValue(new Error('Share failed'));
    window.navigator.share = mockShare;

    render(<SocialShareButton {...mockProps} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Impossible de partager')
      );
    });
  });

  it('ne devrait pas afficher d\'erreur si l\'utilisateur annule', async () => {
    const mockShare = vi.fn().mockRejectedValue({ name: 'AbortError' });
    window.navigator.share = mockShare;

    render(<SocialShareButton {...mockProps} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalled();
    });

    expect(toast.error).not.toHaveBeenCalled();
  });

  it('devrait construire l\'URL correctement', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    window.navigator.clipboard = { writeText: mockWriteText };

    render(<SocialShareButton {...mockProps} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);

    await waitFor(() => {
      const callArg = mockWriteText.mock.calls[0][0];
      expect(callArg).toContain(window.location.origin);
      expect(callArg).toContain('caseId=123');
      expect(callArg).toContain('Aide Urgente');
      expect(callArg).toContain('Casablanca');
    });
  });

  it('devrait désactiver le bouton pendant le partage', async () => {
    const mockShare = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    window.navigator.share = mockShare;

    render(<SocialShareButton {...mockProps} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);

    // Le bouton devrait être désactivé immédiatement
    expect(button).toBeDisabled();

    // Attendre la fin du partage
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    }, { timeout: 200 });
  });

  it('devrait tronquer la description si elle est trop longue', async () => {
    const longDescription = 'A'.repeat(200);
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    window.navigator.clipboard = { writeText: mockWriteText };

    render(<SocialShareButton {...mockProps} description={longDescription} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);

    await waitFor(() => {
      const callArg = mockWriteText.mock.calls[0][0];
      // La description devrait être tronquée à 150 caractères + "..."
      const descMatch = callArg.match(/A+\.\.\./);
      expect(descMatch).toBeTruthy();
    });
  });
});
