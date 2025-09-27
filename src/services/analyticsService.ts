import { api } from '@/lib/api';
import {
    AnalyticsOverview,
    UserAnalytics,
    PropertyAnalytics,
    BlogAnalytics,
    ContactAnalytics,
    EmailAnalytics,
    SystemHealth,
    TrendData,
    RecentActivity,
    AnalyticsFilters,
    KPI,
    ChartData,
    PerformanceMetrics
} from '@/types';

class AnalyticsService {
    private baseUrls = ['/realestate/analytics', '/realestate/analytics'];

    private unwrap<T>(response: any): T {
        return (response?.data?.data ?? response?.data) as T;
    }

    private mapFilters(filters?: AnalyticsFilters): any {
        if (!filters) return undefined;
        const { dateRange, ...rest } = filters as any;
        return { period: dateRange, ...rest };
    }

    private async getWithFallback<T>(path: string, params?: any): Promise<T> {
        let lastError: any;
        for (const base of this.baseUrls) {
            try {
                const response = await api.get(`${base}${path}`, { params });
                return this.unwrap<T>(response);
            } catch (err: any) {
                lastError = err;
                // Try next base
                continue;
            }
        }
        throw lastError;
    }

    // Dashboard Overview
    async getDashboardOverview(filters?: AnalyticsFilters): Promise<AnalyticsOverview> {
        try {
            const data = await this.getWithFallback<any>(`/dashboard/overview`, this.mapFilters(filters));
            return (data?.overview ?? data) as AnalyticsOverview;
        } catch (error) {
            console.error('Failed to fetch dashboard overview:', error);
            throw error;
        }
    }

    // User Analytics
    async getUserAnalytics(filters?: AnalyticsFilters): Promise<UserAnalytics> {
        try {
            return await this.getWithFallback<UserAnalytics>(`/users/engagement`, this.mapFilters(filters));
        } catch (error) {
            console.error('Failed to fetch user analytics:', error);
            throw error;
        }
    }

    // Property Analytics
    async getPropertyAnalytics(filters?: AnalyticsFilters): Promise<PropertyAnalytics> {
        try {
            return await this.getWithFallback<PropertyAnalytics>(`/properties`, this.mapFilters(filters));
        } catch (error) {
            console.error('Failed to fetch property analytics:', error);
            throw error;
        }
    }

    // Blog Analytics
    async getBlogAnalytics(filters?: AnalyticsFilters): Promise<BlogAnalytics> {
        try {
            return await this.getWithFallback<BlogAnalytics>(`/blogs`, this.mapFilters(filters));
        } catch (error) {
            console.error('Failed to fetch blog analytics:', error);
            throw error;
        }
    }

    // Contact Analytics
    async getContactAnalytics(filters?: AnalyticsFilters): Promise<ContactAnalytics> {
        try {
            return await this.getWithFallback<ContactAnalytics>(`/contacts`, this.mapFilters(filters));
        } catch (error) {
            console.error('Failed to fetch contact analytics:', error);
            throw error;
        }
    }

    // Email Analytics
    async getEmailAnalytics(filters?: AnalyticsFilters): Promise<EmailAnalytics> {
        try {
            return await this.getWithFallback<EmailAnalytics>(`/emails`, this.mapFilters(filters));
        } catch (error) {
            console.error('Failed to fetch email analytics:', error);
            throw error;
        }
    }

    // System Health
    async getSystemHealth(): Promise<SystemHealth> {
        try {
            return await this.getWithFallback<SystemHealth>(`/system/health`);
        } catch (error) {
            console.error('Failed to fetch system health:', error);
            throw error;
        }
    }

    // Performance Metrics
    async getPerformanceMetrics(): Promise<PerformanceMetrics> {
        try {
            return await this.getWithFallback<PerformanceMetrics>(`/performance`);
        } catch (error) {
            console.error('Failed to fetch performance metrics:', error);
            throw error;
        }
    }

    // Trend Data
    async getTrendData(filters?: AnalyticsFilters): Promise<TrendData> {
        try {
            return await this.getWithFallback<TrendData>(`/trends`, this.mapFilters(filters));
        } catch (error) {
            console.error('Failed to fetch trend data:', error);
            throw error;
        }
    }

    // Recent Activity
    async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
        try {
            return await this.getWithFallback<RecentActivity[]>(`/recent-activity`, { limit });
        } catch (error) {
            console.error('Failed to fetch recent activity:', error);
            throw error;
        }
    }

    // KPIs
    async getKPIs(filters?: AnalyticsFilters): Promise<KPI[]> {
        try {
            return await this.getWithFallback<KPI[]>(`/kpis`, this.mapFilters(filters));
        } catch (error) {
            console.error('Failed to fetch KPIs:', error);
            throw error;
        }
    }

    // Chart Data
    async getChartData(type: string, filters?: AnalyticsFilters): Promise<ChartData> {
        try {
            return await this.getWithFallback<ChartData>(`/charts/${type}`, this.mapFilters(filters));
        } catch (error) {
            console.error('Failed to fetch chart data:', error);
            throw error;
        }
    }

    // Custom Reports
    async generateCustomReport(reportConfig: {
        type: string;
        filters?: AnalyticsFilters;
        format?: 'json' | 'csv' | 'pdf';
        includeCharts?: boolean;
    }): Promise<any> {
        try {
            // POST doesn't need fallback; assume main base under /analytics
            const response = await api.post(`${this.baseUrls[0]}/reports/custom`, reportConfig);
            return this.unwrap<any>(response);
        } catch (error) {
            console.error('Failed to generate custom report:', error);
            throw error;
        }
    }

    // Export Data
    async exportData(
        type: string,
        format: 'json' | 'csv' | 'excel' = 'json',
        filters?: AnalyticsFilters
    ): Promise<Blob> {
        try {
            // Export endpoint path differs; use fallback bases manually
            let lastError: any;
            for (const base of this.baseUrls) {
                try {
                    const response = await api.get(`${base}/export/${type}`, {
                        params: { ...this.mapFilters(filters), format },
                        responseType: 'blob'
                    });
                    return response.data;
                } catch (err) {
                    lastError = err;
                    continue;
                }
            }
            throw lastError;
        } catch (error) {
            console.error('Failed to export data:', error);
            throw error;
        }
    }

    // Real-time Metrics
    async getRealtimeMetrics(): Promise<{
        activeUsers: number;
        systemLoad: number;
        responseTime: number;
        errorRate: number;
        uptime: number;
    }> {
        try {
            return await this.getWithFallback<any>(`/realtime`);
        } catch (error) {
            console.error('Failed to fetch real-time metrics:', error);
            throw error;
        }
    }

    // Trending Data
    async getTrendingData(type: 'properties' | 'locations' | 'agents' | 'blogs'): Promise<any[]> {
        try {
            return await this.getWithFallback<any[]>(`/trending`, { type });
        } catch (error) {
            console.error('Failed to fetch trending data:', error);
            throw error;
        }
    }

    // Agent Performance
    async getAgentPerformance(filters?: AnalyticsFilters): Promise<{
        topAgents: Array<{
            _id: string;
            name: string;
            email: string;
            propertiesSold: number;
            revenue: number;
            successRate: number;
            rating: number;
        }>;
        performanceMetrics: {
            averageResponseTime: number;
            conversionRate: number;
            customerSatisfaction: number;
        };
    }> {
        try {
            return await this.getWithFallback<any>(`/agents/performance`, this.mapFilters(filters));
        } catch (error) {
            console.error('Failed to fetch agent performance:', error);
            throw error;
        }
    }

    // Revenue Analytics
    async getRevenueAnalytics(filters?: AnalyticsFilters): Promise<{
        totalRevenue: number;
        monthlyRevenue: number;
        revenueByPropertyType: Array<{
            type: string;
            revenue: number;
            percentage: number;
        }>;
        revenueTrends: Array<{
            period: string;
            revenue: number;
            growth: number;
        }>;
    }> {
        try {
            return await this.getWithFallback<any>(`/revenue`, this.mapFilters(filters));
        } catch (error) {
            console.error('Failed to fetch revenue analytics:', error);
            throw error;
        }
    }

    // Newsletter Analytics
    async getNewsletterAnalytics(filters?: AnalyticsFilters): Promise<{
        totalSubscribers: number;
        newSubscribers: number;
        unsubscribers: number;
        openRate: number;
        clickRate: number;
        bounceRate: number;
        subscriberGrowth: Array<{
            period: string;
            subscribers: number;
            growth: number;
        }>;
    }> {
        try {
            return await this.getWithFallback<any>(`/newsletters`, this.mapFilters(filters));
        } catch (error) {
            console.error('Failed to fetch newsletter analytics:', error);
            throw error;
        }
    }
}

export const analyticsService = new AnalyticsService();