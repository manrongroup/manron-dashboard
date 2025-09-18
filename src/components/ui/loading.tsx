import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonChart, SkeletonStatCard, SkeletonList, SkeletonForm, SkeletonDashboard } from './skeleton';

interface LoadingProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'spinner' | 'dots' | 'pulse' | 'bounce';
    text?: string;
    className?: string;
    fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
    size = 'md',
    variant = 'spinner',
    text,
    className,
    fullScreen = false,
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
    };

    const getIcon = () => {
        switch (variant) {
            case 'dots':
                return <DotsLoader size={size} />;
            case 'pulse':
                return <PulseLoader size={size} />;
            case 'bounce':
                return <BounceLoader size={size} />;
            default:
                return <Loader2 className={cn('animate-spin', sizeClasses[size])} />;
        }
    };

    const content = (
        <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
            {getIcon()}
            {text && (
                <p className="text-sm text-muted-foreground animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return content;
};

// Dots loader
const DotsLoader: React.FC<{ size: string }> = ({ size }) => {
    const dotSize = size === 'sm' ? 'h-1 w-1' : size === 'md' ? 'h-2 w-2' : size === 'lg' ? 'h-3 w-3' : 'h-4 w-4';

    return (
        <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className={cn(
                        'rounded-full bg-primary animate-pulse',
                        dotSize
                    )}
                    style={{
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '1s',
                    }}
                />
            ))}
        </div>
    );
};

// Pulse loader
const PulseLoader: React.FC<{ size: string }> = ({ size }) => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : size === 'lg' ? 'h-8 w-8' : 'h-12 w-12';

    return (
        <div className={cn('rounded-full bg-primary animate-pulse', sizeClass)} />
    );
};

// Bounce loader
const BounceLoader: React.FC<{ size: string }> = ({ size }) => {
    const dotSize = size === 'sm' ? 'h-1 w-1' : size === 'md' ? 'h-2 w-2' : size === 'lg' ? 'h-3 w-3' : 'h-4 w-4';

    return (
        <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className={cn(
                        'rounded-full bg-primary animate-bounce',
                        dotSize
                    )}
                    style={{
                        animationDelay: `${i * 0.1}s`,
                    }}
                />
            ))}
        </div>
    );
};

// Loading states for different components
export const LoadingCard: React.FC<{ className?: string }> = ({ className }) => (
    <SkeletonCard className={className} />
);

export const LoadingTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
    rows = 5,
    columns = 4,
    className
}) => (
    <SkeletonTable rows={rows} columns={columns} className={className} />
);

export const LoadingChart: React.FC<{ className?: string }> = ({ className }) => (
    <SkeletonChart className={className} />
);

export const LoadingStatCard: React.FC<{ className?: string }> = ({ className }) => (
    <SkeletonStatCard className={className} />
);

export const LoadingList: React.FC<{ items?: number; className?: string }> = ({
    items = 5,
    className
}) => (
    <SkeletonList items={items} className={className} />
);

export const LoadingForm: React.FC<{ className?: string }> = ({ className }) => (
    <SkeletonForm className={className} />
);

export const LoadingDashboard: React.FC<{ className?: string }> = ({ className }) => (
    <SkeletonDashboard className={className} />
);

// Status-based loading components
interface StatusLoadingProps {
    status: 'loading' | 'success' | 'error' | 'idle';
    loadingText?: string;
    successText?: string;
    errorText?: string;
    onRetry?: () => void;
    className?: string;
}

export const StatusLoading: React.FC<StatusLoadingProps> = ({
    status,
    loadingText = 'Loading...',
    successText = 'Success!',
    errorText = 'Something went wrong',
    onRetry,
    className,
}) => {
    const getContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>{loadingText}</span>
                    </div>
                );
            case 'success':
                return (
                    <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>{successText}</span>
                    </div>
                );
            case 'error':
                return (
                    <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-4 w-4" />
                        <span>{errorText}</span>
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="ml-2 text-sm underline hover:no-underline"
                            >
                                Retry
                            </button>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={cn('flex items-center justify-center p-4', className)}>
            {getContent()}
        </div>
    );
};

// Progress loading
interface ProgressLoadingProps {
    progress: number;
    text?: string;
    className?: string;
}

export const ProgressLoading: React.FC<ProgressLoadingProps> = ({
    progress,
    text,
    className,
}) => (
    <div className={cn('space-y-2', className)}>
        {text && (
            <div className="flex items-center justify-between text-sm">
                <span>{text}</span>
                <span>{Math.round(progress)}%</span>
            </div>
        )}
        <div className="w-full bg-muted rounded-full h-2">
            <div
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
        </div>
    </div>
);

// Skeleton loading for specific content types
export const SkeletonLoading = {
    Card: LoadingCard,
    Table: LoadingTable,
    Chart: LoadingChart,
    StatCard: LoadingStatCard,
    List: LoadingList,
    Form: LoadingForm,
    Dashboard: LoadingDashboard,
};

export default Loading;
