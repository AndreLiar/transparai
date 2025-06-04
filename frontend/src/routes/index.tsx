// src/routes/index.tsx
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../screens/landingPage/LandingPage';
import Signup from '@/screens/AuthenticationsPages/Signup';
import Login from '@/screens/AuthenticationsPages/Login';
import ResetPassword from '@/screens/AuthenticationsPages/ResetPassword';
import VerifyEmail from '@/screens/AuthenticationsPages/VerifyEmail';
import MagicLink from '@/screens/AuthenticationsPages/MagicLink';
import PrivateRoute from '@/components/guard/PrivateRoute';
import Dashboard from '@/screens/Dashboard/Dashboard';
import Infos from '@/screens/Infos/Infos'; // ✅ NEW
import Analyze from '@/screens/Analyse/Analyze'; // ✅ Added
import Upgrade from '@/screens/upgrade/Upgrade'; // ✅ Correct (matches folder casing)
import UpgradeSuccess from '@/screens/upgrade/UpgradeSuccess';
import UpgradeCancel from '@/screens/upgrade/UpgradeCancel';
import History from '@/screens/history/History';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/magic-link" element={<MagicLink />} />
        {/* Protected */}
    <Route
      path="/dashboard"
      element={
        <PrivateRoute requireEmailVerified>
          <Dashboard />
        </PrivateRoute>
      }
    />
       <Route
        path="/infos"
        element={
          <PrivateRoute requireEmailVerified>
            <Infos />
          </PrivateRoute>
        }
      />

<Route
        path="/analyze"
        element={
          <PrivateRoute requireEmailVerified>
            <Analyze />
          </PrivateRoute>
        }
      />
      {/* Future pages: */}
    {/* ✅ Upgrade Page (Protected) */}
      <Route
        path="/upgrade"
        element={
          <PrivateRoute requireEmailVerified>
            <Upgrade />
          </PrivateRoute>
        }
      />

      <Route path="/upgrade-success" element={<UpgradeSuccess />} />
<Route path="/upgrade-cancel" element={<UpgradeCancel />} />
<Route
  path="/history"
  element={
    <PrivateRoute requireEmailVerified>
      <History />
    </PrivateRoute>
  }
/>
    </Routes>
  );
};

export default AppRoutes;
