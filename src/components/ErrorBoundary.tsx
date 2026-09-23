import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 mx-auto max-w-lg rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 shadow-xl text-center space-y-4 animate-fadeIn">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-rose-900 dark:text-rose-100">
              {this.props.fallbackTitle || 'Workspace Recovery Active'}
            </h3>
            <p className="text-xs text-rose-700 dark:text-rose-300">
              A temporary display error was safely intercepted. Your data records are intact.
            </p>
          </div>

          {this.state.error && (
            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-200/50 dark:border-rose-800/50 text-left font-mono text-[11px] text-rose-800 dark:text-rose-300 max-h-32 overflow-y-auto">
              {this.state.error.message}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Component</span>
            </button>

            {this.props.onReset && (
              <button
                onClick={this.props.onReset}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs font-bold flex items-center space-x-1.5 transition shadow-sm hover:bg-rose-100/50"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Dashboard</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
