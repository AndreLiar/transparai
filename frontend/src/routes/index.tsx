import { Routes, Route } from 'react-router-dom';
import LandingPage from '../screens/landingPage/LandingPage';
import Signup from '@/screens/AuthenticationsPages/Signup';
import Login from '@/screens/AuthenticationsPages/Login';
import ResetPassword from '@/screens/AuthenticationsPages/ResetPassword';
import VerifyEmail from '@/screens/AuthenticationsPages/VerifyEmail';
import MagicLink from '@/screens/AuthenticationsPages/MagicLink';
import PrivateRoute from '@/components/guard/PrivateRoute';
import Dashboard from '@/screens/Dashboard/Dashboard';
import Account from '@/screens/Account/Account';
import AnalyzeEnhanced from '@/screens/Analyse/AnalyzeEnhanced';
import Upgrade from '@/screens/upgrade/Upgrade';
import UpgradeSuccess from '@/screens/upgrade/UpgradeSuccess';
import UpgradeCancel from '@/screens/upgrade/UpgradeCancel';
import AISettings from '@/screens/AISettings/AISettings';
import PrivacySettings from '@/screens/PrivacySettings/PrivacySettings';
import Onboarding from '@/screens/Onboarding/Onboarding';
import PrivacyPolicy from '@/screens/legal/PrivacyPolicy';
import TermsOfService from '@/screens/legal/TermsOfService';
import CookiePolicy from '@/screens/legal/CookiePolicy';
import About from '@/screens/About/About';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/magic-link" element={<MagicLink />} />

      {/* Protected — core product */}
      <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/analyze" element={<AnalyzeEnhanced />} />
      <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />
      <Route path="/ai-settings" element={<PrivateRoute><AISettings /></PrivateRoute>} />
      <Route path="/privacy-settings" element={<PrivateRoute><PrivacySettings /></PrivateRoute>} />

      {/* Legacy redirects */}
      <Route path="/infos" element={<PrivateRoute><Account /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Account /></PrivateRoute>} />

      {/* Billing */}
      <Route path="/upgrade" element={<PrivateRoute><Upgrade /></PrivateRoute>} />
      <Route path="/upgrade-success" element={<UpgradeSuccess />} />
      <Route path="/upgrade-cancel" element={<UpgradeCancel />} />

      {/* Legal — required */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
};

export default AppRoutes;
