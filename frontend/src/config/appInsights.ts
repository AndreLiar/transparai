// src/config/appInsights.ts
//
// Azure Application Insights for the React frontend.
// Tracks: page views, unhandled exceptions, custom events, user sessions.
//
// Must be initialised before the React tree renders (called in main.tsx).
// Connection string comes from VITE_APPINSIGHTS_CONNECTION_STRING env var —
// injected by Azure Static Web App deployment settings (mirrors backend Terraform output).

import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

export const reactPlugin = new ReactPlugin();

let appInsights: ApplicationInsights | null = null;

export const initAppInsights = (): void => {
  const connectionString = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING;

  if (!connectionString) {
    if (import.meta.env.PROD) {
      console.warn('[AppInsights] VITE_APPINSIGHTS_CONNECTION_STRING not set — monitoring disabled');
    }
    return;
  }

  appInsights = new ApplicationInsights({
    config: {
      connectionString,
      extensions: [reactPlugin],

      // Page view tracking
      enableAutoRouteTracking: true,

      // Exception tracking
      disableExceptionTracking: false,

      // Ajax / fetch tracking (API calls to backend)
      disableFetchTracking: false,
      disableAjaxTracking: false,

      // Correlation headers — links frontend requests to backend traces
      enableCorsCorrelation: true,
      enableRequestHeaderTracking: true,
      enableResponseHeaderTracking: true,

      // Do not log userId/cookie without consent — we set it manually after auth
      disableCookiesUsage: true,

      // Sample all traffic in prod (lower to 0.5 to halve ingestion costs)
      samplingPercentage: 100,
    },
  });

  appInsights.loadAppInsights();

  // Filter out health-check noise
  appInsights.addTelemetryInitializer((envelope) => {
    const url = (envelope.baseData?.['target'] as string) || '';
    if (url.includes('/health') || url.includes('/ping')) return false;
  });
};

/**
 * Set authenticated user context after Firebase login.
 * Call this in AuthContext when user is resolved.
 */
export const setAppInsightsUser = (uid: string): void => {
  appInsights?.setAuthenticatedUserContext(uid, undefined, false);
};

/**
 * Clear user context on logout.
 */
export const clearAppInsightsUser = (): void => {
  appInsights?.clearAuthenticatedUserContext();
};

/**
 * Track a custom event (e.g. 'AnalysisStarted', 'PlanUpgraded').
 */
export const trackEvent = (name: string, properties?: Record<string, string>): void => {
  appInsights?.trackEvent({ name }, properties);
};

/**
 * Track an exception caught in an error boundary or try/catch.
 */
export const trackException = (error: Error, properties?: Record<string, string>): void => {
  appInsights?.trackException({ exception: error }, properties);
};

/**
 * Track a custom metric (e.g. analysis duration, file size).
 */
export const trackMetric = (name: string, average: number): void => {
  appInsights?.trackMetric({ name, average });
};
