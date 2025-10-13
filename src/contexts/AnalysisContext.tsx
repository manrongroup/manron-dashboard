"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { analyticsService } from "@/services/analyticsService";
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
} from "@/types";


// -------------------- TYPES --------------------
interface AnalyticsStats {
  overview: AnalyticsOverview;
  userStats: UserAnalytics;
  propertyStats: PropertyAnalytics;
  blogStats: BlogAnalytics;
  totalSubscribers: number;
  contactStats: ContactAnalytics;
  emailStats: EmailAnalytics;
  systemHealth: SystemHealth;
  performanceMetrics: PerformanceMetrics;
  recentActivity: RecentActivity[];
  trendsData: TrendData;
  kpis: KPI[];
  chartData: Record<string, ChartData>;
  // Extended datasets from backend GET endpoints
  agentPerformance: {
    agents: Array<{
      fullname?: string;
      email?: string;
      telephone?: string;
      photo?: string;
      rating?: number;
      totalProperties: number;
      soldCount: number;
      rentedCount: number;
      successRate: number;
      totalRevenue: number;
      experience?: number;
    }>;
    period?: string;
  } | null;
  revenue: {
    summary: {
      totalRevenue: number;
      averagePrice: number;
      medianPrice?: number;
      priceRange?: { min: number; max: number };
      soldCount?: number;
      rentedCount?: number;
    };
    monthlyTrends: Array<{ _id?: string | number; revenue?: number; count?: number; year?: number; month?: number }>;
    byType: Array<{ _id?: string; revenue: number; count: number }>;
    currency?: string;
  } | null;
  newsletter: {
    summary: {
      totalSubscribers: number;
      newSubscribers: number;
      activeSubscribers: number;
      unsubscribeRate: number;
    };
    trends: Array<{ _id?: string | number; count?: number; year?: number; month?: number }>
  } | null;
  realtime: {
    activeUsers: number;
    recentProperties?: number;
    recentInquiries?: number;
    systemLoad: number;
    timestamp: string;
  } | null;
  trending: {
    properties?: unknown[];
    locations?: unknown[];
    agents?: unknown[];
    blogs?: unknown[];
  } | null;
}

interface AnalyticsContextType {
  stats: AnalyticsStats | null;
  loading: boolean;
  error: string | null;
  filters: AnalyticsFilters;

  // Methods
  fetchAnalytics: () => Promise<void>;
  setFilters: (filters: Partial<AnalyticsFilters>) => void;
  refreshStats: () => Promise<void>;
  getKPIs: () => KPI[];
  getChartData: (type: 'overview' | 'users' | 'properties' | 'blogs' | 'contacts' | 'emails') => any;
  getRecentActivity: () => RecentActivity[];
  getNotifications: () => any[];
}

// -------------------- CONTEXT --------------------
const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<AnalyticsFilters>({
    dateRange: '30d'
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<AnalyticsStats['agentPerformance']>(null);
  const [revenue, setRevenue] = useState<AnalyticsStats['revenue']>(null);
  const [newsletter, setNewsletter] = useState<AnalyticsStats['newsletter']>(null);
  const [realtime, setRealtime] = useState<AnalyticsStats['realtime']>(null);
  const [trending, setTrending] = useState<AnalyticsStats['trending']>(null);

  const { toast } = useToast();

  // -------------------- DEFAULT DATA GENERATORS --------------------
  const generateDefaultOverview = useCallback((): AnalyticsOverview => ({
    totalUsers: 0,
    totalProperties: 0,
    totalBlogs: 0,
    totalContacts: 0,
    totalEmailsSent: 0,
    activeAgents: 0,
    publishedBlogs: 0,
    pendingContacts: 0,
    growthRate: 0,
    conversionRate: 0,
    revenue: 0,
    monthlyRevenue: 0,
    systemHealth: 95,
    responseTime: 200,
    uptime: 99.9,
    errorRate: 0.1
  }), []);

  const generateDefaultUserAnalytics = useCallback((): UserAnalytics => ({
    totalUsers: 0,
    newUsersThisMonth: 0,
    activeUsers: 0,
    userGrowthRate: 0,
    usersByCategory: [],
    userEngagement: {
      dailyActiveUsers: 0,
      weeklyActiveUsers: 0,
      monthlyActiveUsers: 0
    },
    userRetention: {
      day1: 0,
      day7: 0,
      day30: 0
    }
  }), []);

  const generateDefaultPropertyAnalytics = useCallback((): PropertyAnalytics => ({
    totalProperties: 0,
    featuredProperties: 0,
    recentProperties: 0,
    propertiesGrowthRate: 0,
    propertiesByStatus: [],
    propertiesByType: [],
    averagePrice: 0,
    priceRange: { min: 0, max: 0, average: 0 },
    topLocations: []
  }), []);

  const generateDefaultBlogAnalytics = useCallback((): BlogAnalytics => ({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    blogGrowthRate: 0,
    blogsByCategory: [],
    recentBlogActivity: [],
    topPerformingBlogs: [],
    contentPerformance: {
      averageReadTime: 0,
      bounceRate: 0,
      engagementRate: 0
    }
  }), []);

  const generateDefaultContactAnalytics = useCallback((): ContactAnalytics => ({
    totalContacts: 0,
    newContacts: 0,
    resolvedContacts: 0,
    pendingContacts: 0,
    contactGrowthRate: 0,
    contactsByStatus: [],
    contactsByPriority: [],
    contactTrends: [],
    responseTime: { average: 0, median: 0, p95: 0 },
    conversionRate: 0
  }), []);

  const generateDefaultEmailAnalytics = useCallback((): EmailAnalytics => ({
    totalEmailsSent: 0,
    successfulEmails: 0,
    failedEmails: 0,
    emailSuccessRate: 0,
    emailsByCategory: [],
    emailTrends: [],
    openRate: 0,
    clickRate: 0,
    unsubscribeRate: 0,
    bounceRate: 0
  }), []);

  const generateDefaultSystemHealth = useCallback((): SystemHealth => ({
    systemHealth: 95,
    responseTime: 200,
    uptime: 99.9,
    errorRate: 0.1,
    memoryUsage: 60,
    cpuUsage: 40,
    diskUsage: 50,
    databaseConnections: 10,
    activeSessions: 25
  }), []);

  const generateDefaultPerformanceMetrics = useCallback((): PerformanceMetrics => ({
    responseTime: 200,
    throughput: 1000,
    errorRate: 0.1,
    availability: 99.9,
    memoryUsage: 60,
    cpuUsage: 40,
    databaseQueryTime: 50,
    cacheHitRate: 85
  }), []);

  const generateDefaultTrendData = useCallback((): TrendData => ({
    weekly: [],
    monthly: [],
    yearly: []
  }), []);

  const generateDefaultRecentActivity = useCallback((): RecentActivity[] => [], []);

  const generateDefaultKPIs = useCallback((): KPI[] => [], []);

  // -------------------- API CALLS WITH FALLBACK --------------------
  const fetchDashboardOverview = useCallback(async (): Promise<AnalyticsOverview> => {
    try {
      return await analyticsService.getDashboardOverview(filters);
    } catch (error) {
      console.warn('Failed to fetch dashboard overview, using default data:', error);
      return generateDefaultOverview();
    }
  }, [filters, generateDefaultOverview]);

  const fetchUserAnalytics = useCallback(async (): Promise<UserAnalytics> => {
    try {
      return await analyticsService.getUserAnalytics(filters);
    } catch (error) {
      console.warn('Failed to fetch user analytics, using default data:', error);
      return generateDefaultUserAnalytics();
    }
  }, [filters, generateDefaultUserAnalytics]);

  const fetchPropertyAnalytics = useCallback(async (): Promise<PropertyAnalytics> => {
    try {
      return await analyticsService.getPropertyAnalytics(filters);
    } catch (error) {
      console.warn('Failed to fetch property analytics, using default data:', error);
      return generateDefaultPropertyAnalytics();
    }
  }, [filters, generateDefaultPropertyAnalytics]);

  const fetchBlogAnalytics = useCallback(async (): Promise<BlogAnalytics> => {
    try {
      return await analyticsService.getBlogAnalytics(filters);
    } catch (error) {
      console.warn('Failed to fetch blog analytics, using default data:', error);
      return generateDefaultBlogAnalytics();
    }
  }, [filters, generateDefaultBlogAnalytics]);

  const fetchContactAnalytics = useCallback(async (): Promise<ContactAnalytics> => {
    try {
      return await analyticsService.getContactAnalytics(filters);
    } catch (error) {
      console.warn('Failed to fetch contact analytics, using default data:', error);
      return generateDefaultContactAnalytics();
    }
  }, [filters, generateDefaultContactAnalytics]);

  const fetchEmailAnalytics = useCallback(async (): Promise<EmailAnalytics> => {
    try {
      return await analyticsService.getEmailAnalytics(filters);
    } catch (error) {
      console.warn('Failed to fetch email analytics, using default data:', error);
      return generateDefaultEmailAnalytics();
    }
  }, [filters, generateDefaultEmailAnalytics]);

  const fetchAgentPerformance = useCallback(async () => {
    try {
      const data = await analyticsService.getAgentPerformance(filters);
      return data as any;
    } catch (error) {
      console.warn('Failed to fetch agent performance, using defaults:', error);
      return { agents: [] };
    }
  }, [filters]);

  const fetchRevenue = useCallback(async () => {
    try {
      const data = await analyticsService.getRevenueAnalytics(filters as any);
      return data as any;
    } catch (error) {
      console.warn('Failed to fetch revenue analytics, using defaults:', error);
      return {
        summary: { totalRevenue: 0, averagePrice: 0 },
        monthlyTrends: [],
        byType: [],
        currency: 'RWF'
      };
    }
  }, [filters]);

  const fetchNewsletter = useCallback(async () => {
    try {
      const data = await analyticsService.getNewsletterAnalytics(filters as any);
      return data as any;
    } catch (error) {
      console.warn('Failed to fetch newsletter analytics, using defaults:', error);
      return {
        summary: { totalSubscribers: 0, newSubscribers: 0, activeSubscribers: 0, unsubscribeRate: 0 },
        trends: []
      };
    }
  }, [filters]);

  const fetchRealtime = useCallback(async () => {
    try {
      const data = await analyticsService.getRealtimeMetrics();
      return data as any;
    } catch (error) {
      console.warn('Failed to fetch realtime metrics, using defaults:', error);
      return { activeUsers: 0, systemLoad: 0, responseTime: 0, errorRate: 0, uptime: 0, timestamp: new Date().toISOString() };
    }
  }, []);

  const fetchTrending = useCallback(async () => {
    try {
      const [properties, locations, agents, blogs] = await Promise.all([
        analyticsService.getTrendingData('properties').catch(() => []),
        analyticsService.getTrendingData('locations').catch(() => []),
        analyticsService.getTrendingData('agents').catch(() => []),
        analyticsService.getTrendingData('blogs').catch(() => []),
      ]);
      return { properties, locations, agents, blogs } as any;
    } catch (error) {
      console.warn('Failed to fetch trending data, using defaults:', error);
      return { properties: [], locations: [], agents: [], blogs: [] };
    }
  }, []);

  const fetchSystemHealth = useCallback(async (): Promise<SystemHealth> => {
    try {
      return await analyticsService.getSystemHealth();
    } catch (error) {
      console.warn('Failed to fetch system health, using default data:', error);
      return generateDefaultSystemHealth();
    }
  }, [generateDefaultSystemHealth]);

  const fetchPerformanceMetrics = useCallback(async (): Promise<PerformanceMetrics> => {
    try {
      return await analyticsService.getPerformanceMetrics();
    } catch (error) {
      console.warn('Failed to fetch performance metrics, using default data:', error);
      return generateDefaultPerformanceMetrics();
    }
  }, [generateDefaultPerformanceMetrics]);

  const fetchTrendData = useCallback(async (): Promise<TrendData> => {
    try {
      return await analyticsService.getTrendData(filters);
    } catch (error) {
      console.warn('Failed to fetch trend data, using default data:', error);
      return generateDefaultTrendData();
    }
  }, [filters, generateDefaultTrendData]);

  const fetchRecentActivity = useCallback(async (): Promise<RecentActivity[]> => {
    try {
      return await analyticsService.getRecentActivity(10);
    } catch (error) {
      console.warn('Failed to fetch recent activity, using default data:', error);
      return generateDefaultRecentActivity();
    }
  }, [generateDefaultRecentActivity]);

  const fetchKPIs = useCallback(async (): Promise<KPI[]> => {
    try {
      return await analyticsService.getKPIs(filters);
    } catch (error) {
      console.warn('Failed to fetch KPIs, using default data:', error);
      return generateDefaultKPIs();
    }
  }, [filters, generateDefaultKPIs]);

  // -------------------- MAIN ANALYTICS FUNCTION --------------------
  const fetchAllAnalytics = useCallback(async (): Promise<AnalyticsStats> => {
    // Use Promise.allSettled to handle individual failures gracefully
    const results = await Promise.allSettled([
      fetchDashboardOverview(),
      fetchUserAnalytics(),
      fetchPropertyAnalytics(),
      fetchBlogAnalytics(),
      fetchContactAnalytics(),
      fetchEmailAnalytics(),
      fetchSystemHealth(),
      fetchPerformanceMetrics(),
      fetchTrendData(),
      fetchRecentActivity(),
      fetchKPIs(),
      fetchAgentPerformance(),
      fetchRevenue(),
      fetchNewsletter(),
      fetchRealtime(),
      fetchTrending()
    ]);

    // Extract results or use defaults
    const [
      overviewResult,
      userStatsResult,
      propertyStatsResult,
      blogStatsResult,
      contactStatsResult,
      emailStatsResult,
      systemHealthResult,
      performanceMetricsResult,
      trendsDataResult,
      recentActivityResult,
      kpisResult,
      agentPerformanceResult,
      revenueResult,
      newsletterResult,
      realtimeResult,
      trendingResult
    ] = results;

    const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : generateDefaultOverview();
    const userStats = userStatsResult.status === 'fulfilled' ? userStatsResult.value : generateDefaultUserAnalytics();
    const propertyStats = propertyStatsResult.status === 'fulfilled' ? propertyStatsResult.value : generateDefaultPropertyAnalytics();
    const blogStats = blogStatsResult.status === 'fulfilled' ? blogStatsResult.value : generateDefaultBlogAnalytics();
    const contactStats = contactStatsResult.status === 'fulfilled' ? contactStatsResult.value : generateDefaultContactAnalytics();
    const emailStats = emailStatsResult.status === 'fulfilled' ? emailStatsResult.value : generateDefaultEmailAnalytics();
    const systemHealth = systemHealthResult.status === 'fulfilled' ? systemHealthResult.value : generateDefaultSystemHealth();
    const performanceMetrics = performanceMetricsResult.status === 'fulfilled' ? performanceMetricsResult.value : generateDefaultPerformanceMetrics();
    const trendsData = trendsDataResult.status === 'fulfilled' ? trendsDataResult.value : generateDefaultTrendData();
    const recentActivity = recentActivityResult.status === 'fulfilled' ? recentActivityResult.value : generateDefaultRecentActivity();
    const kpis = kpisResult.status === 'fulfilled' ? kpisResult.value : generateDefaultKPIs();
    const agentPerformance = agentPerformanceResult.status === 'fulfilled' ? (agentPerformanceResult.value as any) : { agents: [] };
    const revenue = revenueResult.status === 'fulfilled' ? (revenueResult.value as any) : { summary: { totalRevenue: 0, averagePrice: 0 }, monthlyTrends: [], byType: [] };
    const newsletter = newsletterResult.status === 'fulfilled' ? (newsletterResult.value as any) : { summary: { totalSubscribers: 0, newSubscribers: 0, activeSubscribers: 0, unsubscribeRate: 0 }, trends: [] };
    const realtime = realtimeResult.status === 'fulfilled' ? (realtimeResult.value as any) : { activeUsers: 0, systemLoad: 0, timestamp: new Date().toISOString() };
    const trending = trendingResult.status === 'fulfilled' ? (trendingResult.value as any) : { properties: [], locations: [], agents: [], blogs: [] };

    // Log any failures for debugging
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const endpointNames = [
          'dashboard overview', 'user analytics', 'property analytics', 'blog analytics',
          'contact analytics', 'email analytics', 'system health', 'performance metrics',
          'trend data', 'recent activity', 'KPIs', 'agent performance', 'revenue analytics',
          'newsletter analytics', 'realtime metrics', 'trending data'
        ];
        console.warn(`Analytics endpoint "${endpointNames[index]}" failed, using default data:`, result.reason);
      }
    });

    return {
      overview,
      userStats,
      propertyStats,
      blogStats,
      contactStats,
      emailStats,
      systemHealth,
      performanceMetrics,
      recentActivity,
      trendsData,
      kpis,
      chartData: {},
      agentPerformance,
      revenue,
      newsletter,
      realtime,
      trending
    };
  }, [
    fetchDashboardOverview,
    fetchUserAnalytics,
    fetchPropertyAnalytics,
    fetchBlogAnalytics,
    fetchContactAnalytics,
    fetchEmailAnalytics,
    fetchSystemHealth,
    fetchPerformanceMetrics,
    fetchTrendData,
    fetchRecentActivity,
    fetchKPIs,
    fetchAgentPerformance,
    fetchRevenue,
    fetchNewsletter,
    fetchRealtime,
    fetchTrending,
    generateDefaultOverview,
    generateDefaultUserAnalytics,
    generateDefaultPropertyAnalytics,
    generateDefaultBlogAnalytics,
    generateDefaultContactAnalytics,
    generateDefaultEmailAnalytics,
    generateDefaultSystemHealth,
    generateDefaultPerformanceMetrics,
    generateDefaultTrendData,
    generateDefaultRecentActivity,
    generateDefaultKPIs
  ]);

  // -------------------- METHODS --------------------
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const analyticsData = await fetchAllAnalytics();
      setStats(analyticsData);

      // Show success toast if we got some real data
      const hasRealData = analyticsData.overview.totalUsers > 0 ||
        analyticsData.overview.totalProperties > 0 ||
        analyticsData.overview.totalBlogs > 0;

      if (hasRealData) {
        toast({
          title: 'Success',
          description: 'Analytics data loaded successfully',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Info',
          description: 'Using default data - some analytics endpoints are unavailable',
          variant: 'default',
        });
      }

    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics data';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAllAnalytics, toast]);

  const setFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const refreshStats = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  const getKPIs = useCallback(() => {
    if (!stats) return [];
    return stats.kpis || [];
  }, [stats]);

  const getChartData = useCallback((type: string) => {
    if (!stats) return null;

    switch (type) {
      case 'overview':
        return stats.trendsData.weekly;
      case 'users':
        return stats.userStats.usersByCategory;
      case 'properties':
        return stats.propertyStats.propertiesByStatus;
      case 'blogs':
        return stats.blogStats.blogsByCategory;
      case 'contacts':
        return stats.contactStats.contactsByStatus;
      case 'emails':
        return stats.emailStats.emailsByCategory;
      default:
        return null;
    }
  }, [stats]);

  const getRecentActivity = useCallback(() => {
    if (!stats) return [];
    return stats.recentActivity || [];
  }, [stats]);

  const getNotifications = useCallback(() => {
    // Generate notifications based on recent activity and system status
    const notifications = [];

    if (stats) {
      // System health notifications
      if (stats.overview.systemHealth < 95) {
        notifications.push({
          id: 'system-health',
          type: 'warning',
          title: 'System Health Alert',
          message: `System health is at ${stats.overview.systemHealth}%`,
          timestamp: new Date().toISOString(),
          priority: 'high'
        });
      }

      // High error rate notification
      if (stats.overview.errorRate > 1) {
        notifications.push({
          id: 'error-rate',
          type: 'error',
          title: 'High Error Rate',
          message: `Error rate is ${stats.overview.errorRate.toFixed(2)}%`,
          timestamp: new Date().toISOString(),
          priority: 'high'
        });
      }

      // New contacts notification
      if (stats.contactStats.newContacts > 0) {
        notifications.push({
          id: 'new-contacts',
          type: 'info',
          title: 'New Contact Inquiries',
          message: `${stats.contactStats.newContacts} new contact inquiries received`,
          timestamp: new Date().toISOString(),
          priority: 'medium'
        });
      }

      // Pending contacts notification
      if (stats.contactStats.pendingContacts > 5) {
        notifications.push({
          id: 'pending-contacts',
          type: 'warning',
          title: 'Pending Contacts',
          message: `${stats.contactStats.pendingContacts} contacts pending response`,
          timestamp: new Date().toISOString(),
          priority: 'medium'
        });
      }
    }

    return notifications;
  }, [stats]);

  // Auto-refresh data on mount
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  // Update notifications when stats change
  useEffect(() => {
    const newNotifications = getNotifications();
    setNotifications(newNotifications);
  }, [stats, getNotifications]);

  const value: AnalyticsContextType = {
    stats,
    loading,
    error,
    filters,
    fetchAnalytics,
    setFilters,
    refreshStats,
    getKPIs,
    getChartData,
    getRecentActivity,
    getNotifications,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// -------------------- HOOK --------------------
export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}