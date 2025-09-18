import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
    renderTime: number;
    memoryUsage: number;
    componentMountTime: number;
    apiResponseTime: number;
    errorCount: number;
    warningCount: number;
}

interface PerformanceConfig {
    enableMemoryTracking: boolean;
    enableRenderTracking: boolean;
    enableApiTracking: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    maxMetricsHistory: number;
}

const defaultConfig: PerformanceConfig = {
    enableMemoryTracking: true,
    enableRenderTracking: true,
    enableApiTracking: true,
    logLevel: 'info',
    maxMetricsHistory: 100,
};

export const usePerformance = (config: Partial<PerformanceConfig> = {}) => {
    const finalConfig = { ...defaultConfig, ...config };
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        renderTime: 0,
        memoryUsage: 0,
        componentMountTime: 0,
        apiResponseTime: 0,
        errorCount: 0,
        warningCount: 0,
    });

    const [isTracking, setIsTracking] = useState(false);
    const mountTimeRef = useRef<number>(0);
    const renderStartRef = useRef<number>(0);
    const metricsHistoryRef = useRef<PerformanceMetrics[]>([]);

    // Track component mount time
    useEffect(() => {
        mountTimeRef.current = performance.now();
        setMetrics(prev => ({
            ...prev,
            componentMountTime: mountTimeRef.current,
        }));
    }, []);

    // Track render performance
    const trackRender = useCallback((componentName: string) => {
        if (!finalConfig.enableRenderTracking) return;

        const renderTime = performance.now() - renderStartRef.current;

        setMetrics(prev => ({
            ...prev,
            renderTime,
        }));

        if (finalConfig.logLevel === 'debug') {
            console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
        }
    }, [finalConfig]);

    // Track memory usage
    const trackMemory = useCallback(() => {
        if (!finalConfig.enableMemoryTracking || !('memory' in performance)) return;

        const memory = (performance as any).memory;
        if (memory) {
            const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
            setMetrics(prev => ({
                ...prev,
                memoryUsage: memoryUsage * 100,
            }));
        }
    }, [finalConfig]);

    // Track API performance
    const trackApiCall = useCallback(async <T>(
        apiCall: () => Promise<T>,
        endpoint: string
    ): Promise<T> => {
        if (!finalConfig.enableApiTracking) return apiCall();

        const startTime = performance.now();

        try {
            const result = await apiCall();
            const endTime = performance.now();
            const responseTime = endTime - startTime;

            setMetrics(prev => ({
                ...prev,
                apiResponseTime: responseTime,
            }));

            if (finalConfig.logLevel === 'debug') {
                console.log(`[Performance] API ${endpoint} completed in ${responseTime.toFixed(2)}ms`);
            }

            return result;
        } catch (error) {
            const endTime = performance.now();
            const responseTime = endTime - startTime;

            setMetrics(prev => ({
                ...prev,
                apiResponseTime: responseTime,
                errorCount: prev.errorCount + 1,
            }));

            if (finalConfig.logLevel === 'error') {
                console.error(`[Performance] API ${endpoint} failed after ${responseTime.toFixed(2)}ms:`, error);
            }

            throw error;
        }
    }, [finalConfig]);

    // Track errors
    const trackError = useCallback((error: Error, context?: string) => {
        setMetrics(prev => ({
            ...prev,
            errorCount: prev.errorCount + 1,
        }));

        if (finalConfig.logLevel === 'error') {
            console.error(`[Performance] Error${context ? ` in ${context}` : ''}:`, error);
        }
    }, [finalConfig]);

    // Track warnings
    const trackWarning = useCallback((message: string, context?: string) => {
        setMetrics(prev => ({
            ...prev,
            warningCount: prev.warningCount + 1,
        }));

        if (finalConfig.logLevel === 'warn') {
            console.warn(`[Performance] Warning${context ? ` in ${context}` : ''}:`, message);
        }
    }, [finalConfig]);

    // Start render tracking
    const startRender = useCallback(() => {
        renderStartRef.current = performance.now();
    }, []);

    // Get performance summary
    const getPerformanceSummary = useCallback(() => {
        const history = metricsHistoryRef.current;
        const avgRenderTime = history.reduce((sum, m) => sum + m.renderTime, 0) / history.length || 0;
        const avgApiResponseTime = history.reduce((sum, m) => sum + m.apiResponseTime, 0) / history.length || 0;
        const totalErrors = history.reduce((sum, m) => sum + m.errorCount, 0);
        const totalWarnings = history.reduce((sum, m) => sum + m.warningCount, 0);

        return {
            current: metrics,
            average: {
                renderTime: avgRenderTime,
                apiResponseTime: avgApiResponseTime,
            },
            totals: {
                errors: totalErrors,
                warnings: totalWarnings,
            },
            history: history.length,
        };
    }, [metrics]);

    // Clear metrics history
    const clearHistory = useCallback(() => {
        metricsHistoryRef.current = [];
    }, []);

    // Start/stop tracking
    const startTracking = useCallback(() => {
        setIsTracking(true);
    }, []);

    const stopTracking = useCallback(() => {
        setIsTracking(false);
    }, []);

    // Update metrics history
    useEffect(() => {
        if (isTracking) {
            metricsHistoryRef.current.push(metrics);
            if (metricsHistoryRef.current.length > finalConfig.maxMetricsHistory) {
                metricsHistoryRef.current.shift();
            }
        }
    }, [metrics, isTracking, finalConfig.maxMetricsHistory]);

    // Periodic memory tracking
    useEffect(() => {
        if (!isTracking || !finalConfig.enableMemoryTracking) return;

        const interval = setInterval(trackMemory, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [isTracking, trackMemory, finalConfig.enableMemoryTracking]);

    return {
        metrics,
        isTracking,
        trackRender,
        trackMemory,
        trackApiCall,
        trackError,
        trackWarning,
        startRender,
        getPerformanceSummary,
        clearHistory,
        startTracking,
        stopTracking,
    };
};

// Hook for component-specific performance tracking
export const useComponentPerformance = (componentName: string, config?: Partial<PerformanceConfig>) => {
    const performance = usePerformance(config);

    useEffect(() => {
        performance.startTracking();
        return () => performance.stopTracking();
    }, [performance]);

    const trackRender = useCallback(() => {
        performance.trackRender(componentName);
    }, [performance, componentName]);

    return {
        ...performance,
        trackRender,
    };
};

// Hook for API performance tracking
export const useApiPerformance = (config?: Partial<PerformanceConfig>) => {
    const performance = usePerformance(config);

    const apiCall = useCallback(async <T>(
        apiFunction: () => Promise<T>,
        endpoint: string
    ): Promise<T> => {
        return performance.trackApiCall(apiFunction, endpoint);
    }, [performance]);

    return {
        apiCall,
        metrics: performance.metrics,
        trackError: performance.trackError,
        trackWarning: performance.trackWarning,
    };
};
