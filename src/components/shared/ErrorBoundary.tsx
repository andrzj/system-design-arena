'use client';

import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm">
            Something went wrong in this panel. Refresh the page to try again.
          </div>
        )
      );
    }
    return this.props.children;
  }
}
