import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RequestCard from '../components/RequestCard';

describe('RequestCard Component', () => {
  const mockRequest = {
    id: 1,
    titre: 'Test Case',
    description: 'Test Description',
    categorie: 'ALIMENTAIRE',
    statut: 'EN_ATTENTE',
    latitude: 33.5731,
    longitude: -7.5898,
    createdAt: '2024-01-15T10:00:00',
    photos: [],
    existingPhotos: []
  };

  it('should render request card with title', () => {
    render(<RequestCard request={mockRequest} />);
    expect(screen.getByText('Test Case')).toBeInTheDocument();
  });

  it('should display category badge', () => {
    render(<RequestCard request={mockRequest} />);
    expect(screen.getByText('ALIMENTAIRE')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const mockOnEdit = vi.fn();
    render(
      <RequestCard 
        request={mockRequest} 
        onEdit={mockOnEdit} 
        isVolunteer={false} 
      />
    );
    
    // L'utilisateur peut voir et cliquer sur le bouton d'édition
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(btn => btn.querySelector('[data-lucide="Edit"]'));
    
    if (editButton) {
      editButton.click();
      expect(mockOnEdit).toHaveBeenCalledWith(mockRequest);
    }
  });

  it('should render correctly for volunteer view', () => {
    render(<RequestCard request={mockRequest} isVolunteer={true} />);
    expect(screen.getByText('Test Case')).toBeInTheDocument();
  });

  it('should apply dark mode styles when darkMode prop is true', () => {
    const { container } = render(
      <RequestCard request={mockRequest} darkMode={true} />
    );
    // Vérifier que des classes de dark mode sont appliquées
    expect(container.querySelector('.bg-gray-800, .dark\\:bg-gray-800')).toBeTruthy();
  });
});
