import { render, screen } from '@testing-library/react';
import Features from '../Features';

describe('Features component', () => {
  it('renders all feature cards with highlights applied', () => {
    render(<Features />);

    const cards = screen.getAllByRole('heading', { level: 5 });
    expect(cards).toHaveLength(6);

    expect(screen.getAllByText('Fonctionnalité Phare')).toHaveLength(3);
    expect(screen.getByText('Analyse IA Ultra-Précise')).toBeInTheDocument();
    expect(screen.getByText(/Suite complète d'outils IA/i)).toBeInTheDocument();
  });
});
