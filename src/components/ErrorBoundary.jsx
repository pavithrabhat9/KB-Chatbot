import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('App crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0e0f29] p-4">
          <div className="bg-[#15173D] border border-red-500/30 rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-[#F1E9E9] mb-2">Something went wrong</h1>
            <p className="text-[#E491C9]/60 text-sm mb-4">
              The application encountered an unexpected error. Please try refreshing the page.
            </p>
            <pre className="bg-black/30 border border-red-500/20 rounded-lg p-3 text-xs text-red-400 text-left overflow-auto max-h-40 mb-4 whitespace-pre-wrap">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-[#982598] to-[#E491C9] hover:from-[#982598] hover:to-[#d07db8] text-[#F1E9E9] font-medium py-2 px-6 rounded-lg transition-all shadow-lg"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;