import { render, screen } from '@testing-library/react';
import QuotaDisplay from '../QuotaDisplay';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, string>) => {
      if (key === 'quota_label') return 'Quota';
      if (key === 'quota_analyses_used') return 'analyses used';
      if (key === 'quota_reset_in') return `Resets in ${opts?.countdown ?? ''}`;
      return key;
    },
  }),
}));

describe('QuotaDisplay', () => {
  it('renders unlimited quota without progress bar', () => {
    render(<QuotaDisplay used={3} limit={-1} countdown="--" />);

    expect(screen.getByText(/3 \/ ∞ analyses used/)).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText(/Resets in/i)).not.toBeInTheDocument();
  });

  it('renders limited quota with progress bar and countdown', () => {
    render(<QuotaDisplay used={5} limit={10} countdown="03:12:44" />);

    const progress = screen.getByRole('progressbar');

    expect(progress).toHaveAttribute('aria-valuenow', '5');
    expect(progress).toHaveAttribute('aria-valuemax', '10');
    expect(progress).toHaveTextContent('50%');
    expect(screen.getByText(/Resets in 03:12:44/)).toBeInTheDocument();
  });
});
