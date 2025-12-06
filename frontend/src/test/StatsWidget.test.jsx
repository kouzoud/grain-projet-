import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatsWidget from '../components/StatsWidget';

describe('StatsWidget Component', () => {
  const mockStats = {
    level: 'Silver',
    points: 350,
    nextLevelPoints: 500,
    missionsCompleted: 12,
    hoursVolunteered: 30,
    impactScore: 92
  };

  it('should render with provided stats', () => {
    render(<StatsWidget stats={mockStats} />);
    
    expect(screen.getByText('Silver')).toBeInTheDocument();
    expect(screen.getByText('350 pts')).toBeInTheDocument();
    expect(screen.getByText('500 pts')).toBeInTheDocument();
  });

  it('should render with default stats when no stats provided', () => {
    render(<StatsWidget />);
    
    expect(screen.getByText('Bronze')).toBeInTheDocument();
    expect(screen.getByText('120 pts')).toBeInTheDocument();
  });

  it('should display missions completed', () => {
    render(<StatsWidget stats={mockStats} />);
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('should display hours volunteered', () => {
    render(<StatsWidget stats={mockStats} />);
    expect(screen.getByText('30h')).toBeInTheDocument();
  });

  it('should display impact score', () => {
    render(<StatsWidget stats={mockStats} />);
    expect(screen.getByText('92')).toBeInTheDocument();
  });

  it('should calculate correct progress percentage', () => {
    render(<StatsWidget stats={mockStats} />);
    const progressBar = document.querySelector('.bg-white.rounded-full');
    expect(progressBar).toHaveStyle({ width: '70%' }); // 350/500 = 70%
  });

  it('should display points remaining for next level', () => {
    render(<StatsWidget stats={mockStats} />);
    expect(screen.getByText(/Plus que 150 pts/)).toBeInTheDocument();
  });
});
