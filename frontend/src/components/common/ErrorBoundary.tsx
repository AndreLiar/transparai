// src/components/common/ErrorBoundary.tsx
//
// React error boundary — catches unhandled render errors and reports them
// to Application Insights instead of crashing the entire app.

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { trackException } from '@/config/appInsights';

interface Props {
  children: ReactNode;
  /** Optional fallback UI. Defaults to a generic error message. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    trackException(error, {
      componentStack: info.componentStack ?? '',
      source: 'ErrorBoundary',
    });
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="container py-5 text-center">
          <div className="alert alert-danger d-inline-block" role="alert">
            <h4 className="alert-heading">Une erreur inattendue s'est produite</h4>
            <p className="mb-0">
              Veuillez recharger la page. Si le problème persiste, contactez le support.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-3 text-start small">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
