// Frontend telemetry shim — no third-party SDK loaded.

export const reactPlugin = { identifier: 'noop-react-plugin' as const };

export const initAppInsights = (): void => {};

export const setAppInsightsUser = (_uid: string): void => {};

export const clearAppInsightsUser = (): void => {};

export const trackEvent = (_name: string, _properties?: Record<string, string>): void => {};

export const trackException = (_error: Error, _properties?: Record<string, string>): void => {};

export const trackMetric = (_name: string, _average: number): void => {};
