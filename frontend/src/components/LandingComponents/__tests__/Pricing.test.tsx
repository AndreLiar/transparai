import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Pricing from '../Pricing';

describe('Pricing component', () => {
  it('renders available plans and CTA links', () => {
    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>,
    );

    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Entreprise')).toBeInTheDocument();

    const links = screen.getAllByRole('link', { name: /Commencer|Analyse/i });
    const hrefs = links.map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(expect.arrayContaining(['/signup', '/analyze']));

    expect(screen.getByText(/Essayez TransparAI Gratuitement/i)).toBeInTheDocument();
  });
});
