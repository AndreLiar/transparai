import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from '../Sidebar';

const fetchDashboardDataMock = vi.fn();
const signOutMock = vi.fn();
const navigateMock = vi.fn();
const setIsOpenMock = vi.fn();
const getIdTokenMock = vi.fn();

vi.mock('@/configFirebase/Firebase', () => ({
  auth: { currentUser: { uid: 'user-1' } },
}));

vi.mock('@/components/Layout/LanguageSwitcher', () => ({
  default: () => <div data-testid="language-switcher-mock" />,
}));

vi.mock('@/components/Layout/ThemeSwitcher', () => ({
  default: () => <div data-testid="theme-switcher-mock" />,
}));

vi.mock('@/components/common/UpgradePrompt', () => ({
  default: () => <div data-testid="upgrade-prompt-mock" />,
}));

const translationMap: Record<string, string> = {
  'sidebar.account': 'Compte',
  'sidebar.analyze': 'Analyser',
  'sidebar.upgrade': 'Mettre à niveau',
  'sidebar.logout': 'Déconnexion',
  'sidebar.open_menu': 'Ouvrir menu',
  'sidebar.home': 'Accueil',
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => translationMap[key] ?? key,
  }),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      getIdToken: getIdTokenMock,
    },
  }),
}));

vi.mock('@/services/InfoService', () => ({
  fetchDashboardData: (...args: unknown[]) => fetchDashboardDataMock(...args),
}));

vi.mock('firebase/auth', () => ({
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ pathname: '/dashboard' }),
  };
});

const renderSidebar = async (plan: 'free' | 'premium' | 'enterprise') => {
  getIdTokenMock.mockResolvedValue('token');
  fetchDashboardDataMock.mockResolvedValue({ plan });

  render(<Sidebar isOpen setIsOpen={setIsOpenMock} />);

  await waitFor(() => expect(fetchDashboardDataMock).toHaveBeenCalled());
};

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders brand, nav items, and controls', async () => {
    await renderSidebar('free');

    expect(screen.getByText('🧠 TransparAI')).toBeInTheDocument();
    expect(screen.getByText(/Analyser/i)).toBeInTheDocument();
    expect(screen.getByText(/Compte/i)).toBeInTheDocument();
    expect(screen.getByText(/Déconnexion/i)).toBeInTheDocument();
    expect(screen.getByTestId('language-switcher-mock')).toBeInTheDocument();
    expect(screen.getByTestId('theme-switcher-mock')).toBeInTheDocument();
  });

  it('shows upgrade prompt for free plan users', async () => {
    await renderSidebar('free');

    expect(screen.getByTestId('upgrade-prompt-mock')).toBeInTheDocument();
  });

  it('navigates to analyze on click and closes sidebar', async () => {
    const user = userEvent.setup();
    await renderSidebar('free');

    await user.click(screen.getByText(/Analyser/i));
    expect(navigateMock).toHaveBeenCalledWith('/analyze');
    expect(setIsOpenMock).toHaveBeenCalledWith(false);
  });

  it('calls signOut and navigates to login on logout', async () => {
    const user = userEvent.setup();
    await renderSidebar('free');

    await user.click(screen.getByText(/Déconnexion/i));
    expect(signOutMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
});
