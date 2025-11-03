import { render, screen } from '@testing-library/react';
import PrivateRoute from '../PrivateRoute';

const authMock = vi.fn();

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => authMock(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">redirect:{to}</div>,
  };
});

describe('PrivateRoute', () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it('shows loader while auth state is loading', () => {
    authMock.mockReturnValue({ loading: true, user: null });
    render(
      <PrivateRoute>
        <div>Protected</div>
      </PrivateRoute>,
    );

    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('redirects to login when no user is present', () => {
    authMock.mockReturnValue({ loading: false, user: null });
    render(
      <PrivateRoute>
        <div>Protected</div>
      </PrivateRoute>,
    );

    expect(screen.getByTestId('navigate')).toHaveTextContent('redirect:/login');
  });

  it('redirects to email verification when required and user not verified', () => {
    authMock.mockReturnValue({
      loading: false,
      user: { emailVerified: false },
    });

    render(
      <PrivateRoute requireEmailVerified>
        <div>Protected</div>
      </PrivateRoute>,
    );

    expect(screen.getByTestId('navigate')).toHaveTextContent('redirect:/verify-email');
  });

  it('renders children when authenticated and verified', () => {
    authMock.mockReturnValue({
      loading: false,
      user: { emailVerified: true },
    });

    render(
      <PrivateRoute requireEmailVerified>
        <div>Protected content</div>
      </PrivateRoute>,
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});
