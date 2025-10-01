import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
            <div className="flex flex-col items-center space-y-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-600 mb-4">
                  We encountered an unexpected error. Don't worry, your data is
                  safe.
                </p>
                {this.state.error && (
                  <details className="text-left bg-gray-50 rounded-lg p-4 mb-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                      Error Details
                    </summary>
                    <pre className="text-xs text-red-600 overflow-auto">
                      {this.state.error.message}
                    </pre>
                  </details>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={this.handleReload}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

