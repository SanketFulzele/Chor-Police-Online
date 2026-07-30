import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
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

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
          <p className="text-4xl mb-4">💥</p>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-text-muted text-sm mb-4 max-w-md">
            {this.state.error?.message ?? "An unexpected error occurred"}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = "/";
            }}
            className="glass rounded-xl px-6 py-2 text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
