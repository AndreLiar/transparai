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

const translationMap: Record<string, string> = {
  'sidebar.account': 'Compte',
  'sidebar.history': 'Historique',
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

  it('renders base menu items and logout control', async () => {
    await renderSidebar('free');

    expect(screen.getByText('🧠 TransparAI')).toBeInTheDocument();
    expect(screen.getByText(/Compte/i)).toBeInTheDocument();
    
    // Look for Historique specifically in navigation buttons, not in upgrade prompt
    const historiqueButton = screen.getByRole('button', { name: /Historique/i });
    expect(historiqueButton).toBeInTheDocument();
    
    expect(screen.getByText(/Analyser/i)).toBeInTheDocument();
    expect(screen.getByText(/Support/)).toBeInTheDocument();
    expect(screen.getByText(/Mettre à niveau/i)).toBeInTheDocument();
    expect(screen.getByText(/Déconnexion/i)).toBeInTheDocument();
    expect(screen.getByTestId('language-switcher-mock')).toBeInTheDocument();
    expect(screen.getByTestId('theme-switcher-mock')).toBeInTheDocument();
  });

  it('includes premium routes when plan is premium', async () => {
    await renderSidebar('premium');

    expect(screen.getByText('Analyse Comparative')).toBeInTheDocument();
    expect(screen.queryByText(/Organisation/)).not.toBeInTheDocument();
  });

  it('includes enterprise menu options when plan is enterprise', async () => {
    await renderSidebar('enterprise');

    expect(screen.getByText('Analyse Comparative')).toBeInTheDocument();
    expect(screen.getByText(/Organisation/)).toBeInTheDocument();
    expect(screen.getByText(/Utilisateurs/)).toBeInTheDocument();
  });

  it('navigates to click targets and logs out', async () => {
    const user = userEvent.setup();
    await renderSidebar('free');

    await user.click(screen.getByText(/Analyser/i));
    expect(navigateMock).toHaveBeenCalledWith('/analyze');
    expect(setIsOpenMock).toHaveBeenCalledWith(false);

    await user.click(screen.getByText(/Déconnexion/i));
    expect(signOutMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
});
