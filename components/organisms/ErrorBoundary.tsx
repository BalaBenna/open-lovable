"use client";
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Card, CardContent, CardHeader, CardFooter } from '../molecules/Card';
import { Icon } from '../atoms/Icon';
import { logger } from '../../lib/logger';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  errorInfo?: React.ErrorInfo;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  errorInfo
}) => {
  const handleReportError = () => {
    // In a real app, you would send this to an error reporting service
    logger.error('User reported error', error, { errorInfo });

    // For now, just log it
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack
    });
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Icon
                icon={AlertTriangle}
                size={32}
                className="text-red-600"
              />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            We encountered an unexpected error. This has been logged and we're working on it.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-muted p-3 rounded-md">
            <p className="text-xs text-muted-foreground font-mono">
              {error.message}
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Show error details
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            onClick={resetError}
            className="flex-1"
            variant="default"
          >
            <Icon icon={RefreshCw} size={16} className="mr-2" />
            Try Again
          </Button>

          <Button
            onClick={handleReportError}
            variant="outline"
            className="flex-1"
          >
            Report Error
          </Button>

          <Button
            onClick={handleGoHome}
            variant="ghost"
            size="sm"
          >
            <Icon icon={Home} size={16} className="mr-2" />
            Go Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): {
    hasError: boolean;
    error: Error;
    errorInfo: null;
  } {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Error boundary caught error', error, {
      componentStack: errorInfo.componentStack
    });

    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          errorInfo={this.state.errorInfo || undefined}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
