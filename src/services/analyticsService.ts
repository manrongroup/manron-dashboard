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
    private baseUrl = '/analytics';

    // Dashboard Overview
    async getDashboardOverview(filters?: AnalyticsFilters): Promise<AnalyticsOverview> {
        try {
            const response = await api.get(`${this.baseUrl}/dashboard/overview`, {
                params: filters
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch dashboard overview:', error);
            throw error;
        }
    }

    // User Analytics
    async getUserAnalytics(filters?: AnalyticsFilters): Promise<UserAnalytics> {
        try {
            const response = await api.get(`${this.baseUrl}/users/engagement`, {
                params: filters
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch user analytics:', error);
            throw error;
        }
    }

    // Property Analytics
    async getPropertyAnalytics(filters?: AnalyticsFilters): Promise<PropertyAnalytics> {
        try {
            const response = await api.get(`${this.baseUrl}/properties`, {
                params: filters
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch property analytics:', error);
            throw error;
        }
    }

    // Blog Analytics
    async getBlogAnalytics(filters?: AnalyticsFilters): Promise<BlogAnalytics> {
        try {
            const response = await api.get(`${this.baseUrl}/blogs`, {
                params: filters
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch blog analytics:', error);
            throw error;
        }
    }

    // Contact Analytics
    async getContactAnalytics(filters?: AnalyticsFilters): Promise<ContactAnalytics> {
        try {
            const response = await api.get(`${this.baseUrl}/contacts`, {
                params: filters
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch contact analytics:', error);
            throw error;
        }
    }

    // Email Analytics
    async getEmailAnalytics(filters?: AnalyticsFilters): Promise<EmailAnalytics> {
        try {
            const response = await api.get(`${this.baseUrl}/emails`, {
                params: filters
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch email analytics:', error);
            throw error;
        }
    }

    // System Health
    async getSystemHealth(): Promise<SystemHealth> {
        try {
            const response = await api.get(`${this.baseUrl}/system/health`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch system health:', error);
            throw error;
        }
    }

    // Performance Metrics
    async getPerformanceMetrics(): Promise<PerformanceMetrics> {
        try {
            const response = await api.get(`${this.baseUrl}/performance`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch performance metrics:', error);
            throw error;
        }
    }

    // Trend Data
    async getTrendData(filters?: AnalyticsFilters): Promise<TrendData> {
        try {
            const response = await api.get(`${this.baseUrl}/trends`, {
                params: filters
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch trend data:', error);
            throw error;
        }
    }

    // Recent Activity
    async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
        try {
            const response = await api.get(`${this.baseUrl}/recent-activity`, {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch recent activity:', error);
            throw error;
        }
    }

    // KPIs
    async getKPIs(filters?: AnalyticsFilters): Promise<KPI[]> {
        try {
            const response = await api.get(`${this.baseUrl}/kpis`, {
                params: filters
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch KPIs:', error);
            throw error;
        }
    }

    // Chart Data
    async getChartData(type: string, filters?: AnalyticsFilters): Promise<ChartData> {
        try {
            const response = await api.get(`${this.baseUrl}/charts/${type}`, {
                params: filters
            });
            return response.data;
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
            const response = await api.post(`${this.baseUrl}/reports/custom`, reportConfig);
            return response.data;
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
            const response = await api.get(`${this.baseUrl}/export/${type}`, {
                params: { ...filters, format },
                responseType: 'blob'
            });
            return response.data;
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
            const response = await api.get(`${this.baseUrl}/realtime`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch real-time metrics:', error);
            throw error;
        }
    }

    // Trending Data
    async getTrendingData(type: 'content' | 'locations' | 'searches'): Promise<any[]> {
        try {
            const response = await api.get(`${this.baseUrl}/trending/${type}`);
            return response.data;
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
            const response = await api.get(`${this.baseUrl}/agents/performance`, {
                params: filters
            });
            return response.data;
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
            const response = await api.get(`${this.baseUrl}/revenue`, {
                params: filters
            });
            return response.data;
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
            const response = await api.get(`${this.baseUrl}/newsletters`, {
                params: filters
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch newsletter analytics:', error);
            throw error;
        }
    }
}

export const analyticsService = new AnalyticsService();