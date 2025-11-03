import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageSwitcher from '../LanguageSwitcher';

const changeLanguageMock = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      changeLanguage: changeLanguageMock,
    },
  }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    changeLanguageMock.mockClear();
  });

  it('switches to French when FR button is clicked', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByRole('button', { name: '🇫🇷' }));

    expect(changeLanguageMock).toHaveBeenCalledWith('fr');
  });

  it('switches to English when EN button is clicked', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByRole('button', { name: '🇬🇧' }));

    expect(changeLanguageMock).toHaveBeenCalledWith('en');
  });
});
