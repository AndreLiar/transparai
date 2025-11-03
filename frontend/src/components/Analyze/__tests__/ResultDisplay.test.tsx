import { render, screen } from '@testing-library/react';
import ResultDisplay from '../ResultDisplay';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        result_title: 'Analysis Result',
        result_subtitle: 'Here is what we found',
        summary: 'Summary',
        score: 'Score',
        important_clauses: 'Important Clauses',
      };
      return map[key] ?? key;
    },
  }),
}));

describe('ResultDisplay', () => {
  it('renders summary, score, and clauses', () => {
    render(
      <ResultDisplay
        summary="Contract is balanced."
        score="A"
        clauses={['Clause 1', 'Clause 2']}
      />,
    );

    expect(screen.getByText('Analysis Result')).toBeInTheDocument();
    expect(screen.getByText('Here is what we found')).toBeInTheDocument();
    expect(screen.getByText('Contract is balanced.')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('Clause 1')).toBeInTheDocument();
    expect(screen.getByText('Clause 2')).toBeInTheDocument();
  });
});
