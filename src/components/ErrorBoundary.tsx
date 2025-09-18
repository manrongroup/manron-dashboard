import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    showDetails?: boolean;
    enableReporting?: boolean;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
    private retryCount = 0;
    private maxRetries = 3;

    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: '',
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
            errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo,
        });

        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        // Call custom error handler
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Report error to monitoring service in production
        if (process.env.NODE_ENV === 'production' && this.props.enableReporting) {
            this.reportError(error, errorInfo);
        }
    }

    private reportError = (error: Error, errorInfo: ErrorInfo) => {
        const errorReport = {
            errorId: this.state.errorId,
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: localStorage.getItem('userId') || 'anonymous',
        };

        // Send to error reporting service
        fetch('/api/errors/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(errorReport),
        }).catch(console.error);
    };

    private handleRetry = () => {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
                errorId: '',
            });
        }
    };

    private handleReload = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    private handleReportBug = () => {
        const errorDetails = {
            errorId: this.state.errorId,
            message: this.state.error?.message,
            stack: this.state.error?.stack,
            componentStack: this.state.errorInfo?.componentStack,
        };

        const mailtoLink = `mailto:support@manron.com?subject=Bug Report - ${this.state.errorId}&body=${encodeURIComponent(JSON.stringify(errorDetails, null, 2))}`;
        window.open(mailtoLink);
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <Card className="w-full max-w-2xl">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-6 w-6 text-destructive" />
                            </div>
                            <CardTitle className="text-2xl">Something went wrong</CardTitle>
                            <CardDescription>
                                We're sorry, but something unexpected happened. Please try again or contact support if the problem persists.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Alert>
                                <Bug className="h-4 w-4" />
                                <AlertDescription>
                                    Error ID: <code className="text-xs">{this.state.errorId}</code>
                                </AlertDescription>
                            </Alert>

                            {this.props.showDetails && this.state.error && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Error Details:</h4>
                                    <div className="rounded-md bg-muted p-3">
                                        <pre className="text-xs text-muted-foreground overflow-auto">
                                            {this.state.error.message}
                                            {this.state.error.stack && `\n\n${this.state.error.stack}`}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3">
                                {this.retryCount < this.maxRetries && (
                                    <Button onClick={this.handleRetry} className="flex-1">
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Try Again ({this.maxRetries - this.retryCount} attempts left)
                                    </Button>
                                )}

                                <Button onClick={this.handleReload} variant="outline" className="flex-1">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Reload Page
                                </Button>

                                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                                    <Home className="mr-2 h-4 w-4" />
                                    Go Home
                                </Button>
                            </div>

                            {this.props.enableReporting && (
                                <div className="text-center">
                                    <Button onClick={this.handleReportBug} variant="ghost" size="sm">
                                        <Bug className="mr-2 h-4 w-4" />
                                        Report Bug
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

// Higher-order component for error boundaries
export const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<Props, 'children'>
) => {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
};

// Hook for error handling
export const useErrorHandler = () => {
    const handleError = React.useCallback((error: Error, context?: string) => {
        console.error(`Error${context ? ` in ${context}` : ''}:`, error);

        // You can add more error handling logic here
        // such as sending to error reporting service
    }, []);

    const handleAsyncError = React.useCallback((error: unknown, context?: string) => {
        if (error instanceof Error) {
            handleError(error, context);
        } else {
            handleError(new Error(String(error)), context);
        }
    }, [handleError]);

    return { handleError, handleAsyncError };
};
