// Backend/config/appInsights.js
// Telemetry shim — optional hooks are no-ops unless you wire a provider here.

const initAppInsights = () => null;

const trackEvent = () => {};
const trackException = () => {};
const trackMetric = () => {};
const setUserContext = () => {};

module.exports = {
  initAppInsights,
  trackEvent,
  trackException,
  trackMetric,
  setUserContext,
  getClient: () => null,
};
