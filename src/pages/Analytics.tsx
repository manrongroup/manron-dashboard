import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import StatCard from '@/components/ui/stat-card';
import { useAnalytics } from '@/contexts/AnalysisContext';
import {
  Users,
  Home,
  MessageSquare,
  TrendingUp,
  Calendar,
  RefreshCw,
  DollarSign,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Analytics() {
  const {
    stats,
    loading,
    error,
    filters,
    setFilters,
    refreshStats
  } = useAnalytics();

  const [refreshing, setRefreshing] = useState(false);

  // Essential utility functions
  const formatNumber = useCallback((num) => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }, []);

  const formatCurrency = useCallback((amount) => {
    const validAmount = typeof amount === 'number' ? amount : 0;
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(validAmount);
  }, []);

  // Essential handlers
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await refreshStats();
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, refreshStats]);

  const handleDateRangeChange = useCallback((value) => {
    setFilters({ dateRange: value });
  }, [setFilters]);

  // Simplified data processing
  const processedStats = useMemo(() => {
    if (!stats) return null;

    return {
      overview: stats.overview || {
        totalUsers: 0,
        totalProperties: 0,
        totalContacts: 0,
        revenue: 0,
        monthlyRevenue: 0
      },
      propertyStats: stats.propertyStats || {
        totalProperties: 0,
        propertiesByStatus: [],
        propertiesByType: [],
        averagePrice: 0,
        topLocations: []
      },
      revenue: stats.revenue || {
        summary: {
          totalRevenue: 0,
          averagePrice: 0,
          soldCount: 0,
          rentedCount: 0
        },
        monthlyTrends: []
      }
    };
  }, [stats]);

  // Essential KPIs for real estate
  const essentialKPIs = useMemo(() => {
    if (!processedStats) return [];

    const { overview, propertyStats, revenue } = processedStats;

    return [
      {
        title: 'Total Properties',
        value: formatNumber(overview.totalProperties),
        change: 12.5,
        isPositive: true,
        period: 'vs last month',
        description: 'Properties listed',
        icon: Home,
        category: 'properties'
      },
      {
        title: 'Total Revenue',
        value: formatCurrency(revenue.summary?.totalRevenue),
        change: 15.2,
        isPositive: true,
        period: 'vs last month',
        description: `${revenue.summary?.soldCount || 0} sold, ${revenue.summary?.rentedCount || 0} rented`,
        icon: DollarSign,
        category: 'revenue'
      },
      {
        title: 'Total Users',
        value: formatNumber(overview.totalUsers),
        change: 8.3,
        isPositive: true,
        period: 'vs last month',
        description: 'Registered users',
        icon: Users,
        category: 'users'
      },
      {
        title: 'Inquiries',
        value: formatNumber(overview.totalContacts),
        change: 5.7,
        isPositive: true,
        period: 'vs last month',
        description: 'Property inquiries',
        icon: MessageSquare,
        category: 'contacts'
      }
    ];
  }, [processedStats, formatNumber, formatCurrency]);

  // Simplified chart data
  const chartData = useMemo(() => {
    if (!processedStats) return {};

    const { revenue, propertyStats } = processedStats;

    return {
      revenueTimeSeries: (revenue.monthlyTrends || []).map((item) => ({
        name: `${item.year}-${String(item.month).padStart(2, '0')}`,
        revenue: item.revenue || 0,
        count: item.count || 0,
        date: new Date(item.year, item.month - 1).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric'
        })
      })),
      propertyStatus: (propertyStats.propertiesByStatus || []).map((item) => ({
        name: item.name || 'Unknown',
        value: item.value || 0
      })),
      propertyTypes: (propertyStats.propertiesByType || []).map((item) => ({
        name: item.name || 'Unknown',
        value: item.value || 0
      }))
    };
  }, [processedStats]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md text-center border-destructive">
          <CardHeader>
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Analytics Error</CardTitle>
            <CardDescription className="text-muted-foreground">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleRefresh} className="w-full" variant="outline" disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Try Again'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!processedStats) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>Analytics data is not available at the moment.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Load Data
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Real estate platform analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filters.dateRange || '30d'} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {essentialKPIs.map((kpi, index) => (
          <StatCard
            key={index}
            title={kpi.title}
            value={kpi.value.toString()}
            description={kpi.description || ''}
            icon={kpi.icon || TrendingUp}
            variant={kpi.isPositive ? 'success' : 'warning'}
            trend={kpi.change !== undefined ? {
              value: kpi.change,
              isPositive: kpi.isPositive ?? true,
              period: kpi.period || 'vs previous period'
            } : undefined}
            clickable={true}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.revenueTimeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Property Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Property Status</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chartData.propertyStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.propertyStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatNumber(value), 'Properties']} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Types */}
      <Card>
        <CardHeader>
          <CardTitle>Property Types</CardTitle>
          <CardDescription>Distribution by property type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.propertyTypes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Locations */}
      {processedStats.propertyStats.topLocations && processedStats.propertyStats.topLocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Top Locations
            </CardTitle>
            <CardDescription>Most popular property locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processedStats.propertyStats.topLocations.slice(0, 5).map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{location.name}</span>
                  </div>
                  <Badge variant="outline">{location.value} properties</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}