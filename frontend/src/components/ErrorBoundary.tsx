import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-4xl">⚠️</p>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Something went wrong
          </h1>
          <p className="max-w-sm text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {this.state.error.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--color-green-dark)' }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
