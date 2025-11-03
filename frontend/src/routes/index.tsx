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
import Account from '@/screens/Account/Account'; // ✅ NEW - Merged Profile + Infos
import AnalyzeEnhanced from '@/screens/Analyse/AnalyzeEnhanced'; // ✅ Enhanced version
import Upgrade from '@/screens/upgrade/Upgrade'; // ✅ Correct (matches folder casing)
import UpgradeSuccess from '@/screens/upgrade/UpgradeSuccess';
import UpgradeCancel from '@/screens/upgrade/UpgradeCancel';
import History from '@/screens/history/History';
import PrivacyPolicy from '@/screens/legal/PrivacyPolicy';
import TermsOfService from '@/screens/legal/TermsOfService';
import Contact from '@/screens/legal/Contact';
import CookiePolicy from '@/screens/legal/CookiePolicy';
import Help from '@/screens/Help/Help';
import FAQ from '@/screens/FAQ/FAQ';
import About from '@/screens/About/About';
import Security from '@/screens/Security/Security';
import Compare from '@/screens/Compare/Compare';
import ApiDocs from '@/screens/ApiDocs/ApiDocs';
import Support from '@/screens/Support/Support';
import OrganizationDashboard from '@/screens/Organization/OrganizationDashboard';
import UserManagement from '@/screens/Organization/UserManagement';
import AcceptInvitation from '@/screens/AcceptInvitation/AcceptInvitation';
import AISettings from '@/screens/AISettings/AISettings';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/magic-link" element={<MagicLink />} />
      <Route path="/accept-invitation" element={<AcceptInvitation />} />
        {/* Protected */}
    <Route
      path="/dashboard"
      element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      }
    />
       <Route
        path="/account"
        element={
          <PrivateRoute>
            <Account />
          </PrivateRoute>
        }
      />

      <Route
        path="/ai-settings"
        element={
          <PrivateRoute>
            <AISettings />
          </PrivateRoute>
        }
      />

      {/* Legacy redirects */}
      <Route
        path="/infos"
        element={
          <PrivateRoute>
            <Account />
          </PrivateRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Account />
          </PrivateRoute>
        }
      />

<Route
        path="/analyze"
        element={
          <PrivateRoute>
            <AnalyzeEnhanced />
          </PrivateRoute>
        }
      />

      <Route
        path="/compare"
        element={
          <PrivateRoute requireEmailVerified>
            <Compare />
          </PrivateRoute>
        }
      />

      <Route
        path="/support"
        element={
          <PrivateRoute requireEmailVerified>
            <Support />
          </PrivateRoute>
        }
      />

      <Route
        path="/organization"
        element={
          <PrivateRoute requireEmailVerified>
            <OrganizationDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/user-management"
        element={
          <PrivateRoute requireEmailVerified>
            <UserManagement />
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

      {/* Legal Pages (Public) */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="/help" element={<Help />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/about" element={<About />} />
      <Route path="/security" element={<Security />} />
      <Route path="/api" element={<ApiDocs />} />
    </Routes>
  );
};

export default AppRoutes;
