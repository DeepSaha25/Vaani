import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-black text-red-500 p-8 text-center z-[9999] relative">
                    <h1 className="text-4xl font-black mb-4">Something went wrong.</h1>
                    <p className="text-xl text-white mb-8">The application crashed. Here is the error:</p>
                    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-4xl w-full overflow-auto text-left">
                        <p className="font-mono font-bold">{this.state.error && this.state.error.toString()}</p>
                        <pre className="font-mono text-xs mt-4 text-red-300">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition"
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
