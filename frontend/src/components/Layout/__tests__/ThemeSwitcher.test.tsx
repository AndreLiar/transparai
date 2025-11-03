import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeSwitcher from '../ThemeSwitcher';

const setThemeMock = vi.fn();
const useThemeMock = vi.fn();

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => useThemeMock(),
}));

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    setThemeMock.mockClear();
    useThemeMock.mockReset();
  });

  it.each([
    ['🌞', 'light', 'dark'],
    ['🌙', 'dark', 'light'],
    ['💻', 'system', 'light'],
  ])('changes theme to %s button target', async (icon, expectedTheme, activeTheme) => {
    useThemeMock.mockReturnValue({ theme: activeTheme, setTheme: setThemeMock });
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    await user.click(screen.getByRole('button', { name: icon }));

    expect(setThemeMock).toHaveBeenCalledWith(expectedTheme);
  });
});
