import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatCard from '@/components/ui/stat-card';
import { useAnalytics } from '@/contexts/AnalysisContext';
import {
  BarChart3,
  Users,
  Home,
  FileText,
  Mail,
  MessageSquare,
  TrendingUp,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  Activity,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Zap,
  Shield,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Target,
  Percent,
  Star,
  MapPin,
  PieChart,
  LineChart,
  Settings,
  Bell,
  UserCheck,
  Briefcase,
  TrendingDown,
  Globe,
  Server
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
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
  Legend,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  Scatter,
  ScatterChart
} from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#84cc16'];

export default function Analytics() {
  const {
    stats,
    loading,
    error,
    filters,
    setFilters,
    refreshStats,
    getKPIs,
    getChartData
  } = useAnalytics();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [activeTab, setActiveTab] = useState('overview');
  const [exportFormat, setExportFormat] = useState('csv');

  // Enhanced utility functions
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

  const formatPercentage = useCallback((value) => {
    const validValue = typeof value === 'number' ? value : 0;
    return `${validValue.toFixed(1)}%`;
  }, []);

  const getTrendIcon = useCallback((value) => {
    return (value ?? 0) >= 0 ? ArrowUpRight : ArrowDownRight;
  }, []);

  const getTrendColor = useCallback((value) => {
    return (value ?? 0) >= 0 ? 'text-green-600' : 'text-red-600';
  }, []);

  const getMetricIcon = useCallback((metric) => {
    const iconMap = {
      users: Users,
      properties: Home,
      blogs: FileText,
      contacts: MessageSquare,
      emails: Mail,
      revenue: DollarSign,
      performance: Target,
      system: Shield,
      engagement: Activity,
      conversion: Percent
    };
    return iconMap[metric] || Activity;
  }, []);

  // Enhanced handlers
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

  const handleExport = useCallback(() => {
    console.log(`Exporting analytics data as ${exportFormat}...`);
    // Implementation for data export
  }, [exportFormat]);

  // Enhanced data processing
  const processedStats = useMemo(() => {
    if (!stats) return null;

    return {
      overview: stats.overview || {},
      userStats: stats.userStats || {},
      propertyStats: stats.propertyStats || {},
      blogStats: stats.blogStats || {},
      contactStats: stats.contactStats || {},
      emailStats: stats.emailStats || {},
      systemHealth: stats.systemHealth || {},
      agentPerformance: stats.agentPerformance || { agents: [] },
      revenue: stats.revenue || { summary: {}, monthlyTrends: [], byType: [] },
      newsletter: stats.newsletter || { summary: {}, trends: [] },
      realtime: stats.realtime || {},
      trending: stats.trending || {},
      recentActivity: stats.recentActivity || {}
    };
  }, [stats]);

  // Enhanced KPIs with comprehensive metrics
  const enhancedKPIs = useMemo(() => {
    if (!processedStats) return [];

    const { overview, userStats, propertyStats, blogStats, contactStats, revenue, newsletter } = processedStats;

    return [
      {
        title: 'Total Users',
        value: formatNumber(overview.totalUsers),
        change: userStats.userGrowthRate,
        isPositive: (userStats.userGrowthRate ?? 0) >= 0,
        period: 'vs last month',
        description: `${userStats.activeUsers || 0} active users`,
        badge: `${userStats.newUsersThisMonth || 0} new`,
        icon: Users,
        category: 'users'
      },
      {
        title: 'Properties',
        value: formatNumber(overview.totalProperties),
        change: propertyStats.propertiesGrowthRate,
        isPositive: (propertyStats.propertiesGrowthRate ?? 0) >= 0,
        period: 'vs last month',
        description: `${propertyStats.featuredProperties || 0} featured`,
        badge: formatCurrency(propertyStats.averagePrice),
        icon: Home,
        category: 'properties'
      },
      {
        title: 'Blog Posts',
        value: formatNumber(overview.totalBlogs),
        change: blogStats.blogGrowthRate,
        isPositive: (blogStats.blogGrowthRate ?? 0) >= 0,
        period: 'vs last month',
        description: `${blogStats.publishedBlogs || 0} published`,
        badge: `${blogStats.draftBlogs || 0} drafts`,
        icon: FileText,
        category: 'blogs'
      },
      {
        title: 'Total Revenue',
        value: formatCurrency(revenue.summary?.totalRevenue),
        change: 15.2,
        isPositive: true,
        period: 'vs last month',
        description: `${revenue.summary?.soldCount || 0} properties sold`,
        badge: formatCurrency(revenue.summary?.averagePrice),
        icon: DollarSign,
        category: 'revenue'
      },
      {
        title: 'Inquiries',
        value: formatNumber(overview.totalContacts),
        change: contactStats.contactGrowthRate,
        isPositive: (contactStats.contactGrowthRate ?? 0) >= 0,
        period: 'vs last month',
        description: `${contactStats.newContacts || 0} new inquiries`,
        badge: `${formatPercentage(contactStats.conversionRate)} conversion`,
        icon: MessageSquare,
        category: 'contacts'
      },
      {
        title: 'Newsletter',
        value: formatNumber(newsletter.summary?.totalSubscribers),
        change: newsletter.summary?.newSubscribers || 0,
        isPositive: true,
        period: 'new subscribers',
        description: `${newsletter.summary?.activeSubscribers || 0} active`,
        badge: `${formatPercentage(newsletter.summary?.unsubscribeRate)} churn`,
        icon: Mail,
        category: 'newsletter'
      },
      {
        title: 'System Health',
        value: formatPercentage(overview.systemHealth),
        change: 2.1,
        isPositive: true,
        period: 'vs last week',
        description: 'All systems operational',
        badge: `${overview.responseTime || 0}ms response`,
        icon: Shield,
        category: 'system'
      },
      {
        title: 'Conversion Rate',
        value: formatPercentage(overview.conversionRate),
        change: 1.8,
        isPositive: true,
        period: 'vs last month',
        description: 'Inquiry to sale conversion',
        badge: 'Excellent',
        icon: Target,
        category: 'conversion'
      }
    ];
  }, [processedStats, formatNumber, formatCurrency, formatPercentage]);

  // Enhanced chart data processing
  const chartData = useMemo(() => {
    if (!processedStats) return {};

    const { revenue, userStats, propertyStats, blogStats, trending, systemHealth } = processedStats;

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
      revenueByType: (revenue.byType || []).map((item) => ({
        name: item._id || 'Unknown',
        value: item.revenue || 0,
        count: item.count || 0
      })),
      userDistribution: (userStats.usersByCategory || []).map((item) => ({
        name: item.name || item._id || 'Unknown',
        value: item.value || item.count || 0
      })),
      propertyStatus: (propertyStats.propertiesByStatus || []).map((item) => ({
        name: item.name || item._id || 'Unknown',
        value: item.value || item.count || 0
      })),
      propertyTypes: (propertyStats.propertiesByType || []).map((item) => ({
        name: item.name || item._id || 'Unknown',
        value: item.value || item.count || 0
      })),
      blogCategories: (blogStats.blogsByCategory || []).map((item) => ({
        name: item.name || item._id || 'Unknown',
        value: item.value || item.count || 0
      })),
      systemMetrics: [
        { name: 'CPU', value: systemHealth.cpuUsage || 40 },
        { name: 'Memory', value: systemHealth.memoryUsage || 60 },
        { name: 'Disk', value: systemHealth.diskUsage || 50 }
      ]
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
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <Skeleton className="h-12 w-full" />

        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Enhanced error state
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
            <Button onClick={() => setFilters({ dateRange: '7d' })} variant="ghost" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Change Time Range
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
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <span>Comprehensive system analytics and insights</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filters.dateRange || '30d'} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="xlsx">Excel</SelectItem>
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
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Enhanced Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {enhancedKPIs.slice(0, 8).map((kpi, index) => (
          <StatCard
            key={index}
            title={kpi.title}
            value={kpi.value.toString()}
            description={kpi.description || ''}
            icon={kpi.icon || Activity}
            variant={kpi.isPositive ? 'success' : 'warning'}
            trend={kpi.change !== undefined ? {
              value: kpi.change,
              isPositive: kpi.isPositive ?? true,
              period: kpi.period || 'vs previous period'
            } : undefined}
            badge={kpi.badge ? { text: kpi.badge, variant: 'secondary' } : undefined}
            clickable={true}
            onClick={() => setActiveTab(kpi.category || 'overview')}
          />
        ))}
      </div>

      {/* System Health Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatPercentage(processedStats.overview.systemHealth)}
            </div>
            <div className="mt-2 space-y-1">
              <Progress 
                value={processedStats.overview.systemHealth || 0} 
                className="h-2" 
              />
              <p className="text-xs text-muted-foreground">
                {(processedStats.overview.systemHealth || 0) > 95 ? 'Excellent' : 
                 (processedStats.overview.systemHealth || 0) > 80 ? 'Good' : 'Needs Attention'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {processedStats.overview.responseTime || 0}ms
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(processedStats.overview.responseTime || 0) < 200 ? 'Excellent' :
               (processedStats.overview.responseTime || 0) < 500 ? 'Good' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatPercentage(processedStats.overview.uptime)}
            </div>
            <div className="flex items-center mt-1">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              <p className="text-xs text-muted-foreground">
                System operational
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatPercentage(processedStats.overview.errorRate)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(processedStats.overview.errorRate || 0) < 1 ? 'Excellent' :
               (processedStats.overview.errorRate || 0) < 5 ? 'Good' : 'High error rate'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Tabbed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.revenueTimeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value) : value,
                        name === 'revenue' ? 'Revenue' : 'Properties Sold'
                      ]} />
                      <Bar yAxisId="right" dataKey="count" fill="#06b6d4" opacity={0.6} />
                      <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Property Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Property Distribution</CardTitle>
                <CardDescription>Breakdown by property status</CardDescription>
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

          {/* Activity Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Daily Active</span>
                  <span className="font-semibold">{formatNumber(processedStats.userStats.userEngagement?.dailyActiveUsers)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Weekly Active</span>
                  <span className="font-semibold">{formatNumber(processedStats.userStats.userEngagement?.weeklyActiveUsers)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Monthly Active</span>
                  <span className="font-semibold">{formatNumber(processedStats.userStats.userEngagement?.monthlyActiveUsers)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg. Read Time</span>
                  <span className="font-semibold">{processedStats.blogStats.contentPerformance?.averageReadTime || 0} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Engagement Rate</span>
                  <span className="font-semibold">{formatPercentage(processedStats.blogStats.contentPerformance?.engagementRate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Bounce Rate</span>
                  <span className="font-semibold">{formatPercentage(processedStats.blogStats.contentPerformance?.bounceRate)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Response Time</span>
                  <span className="font-semibold">{processedStats.contactStats.responseTime?.average || 0} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Conversion Rate</span>
                  <span className="font-semibold">{formatPercentage(processedStats.contactStats.conversionRate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending</span>
                  <Badge variant="outline">{processedStats.contactStats.pendingContacts || 0}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Property Type</CardTitle>
                <CardDescription>Performance breakdown by property category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.revenueByType} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                      <Bar dataKey="value" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Summary */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
              <CardHeader>
                <CardTitle className="text-emerald-700 dark:text-emerald-300">Revenue Summary</CardTitle>
                <CardDescription>Key financial metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(processedStats.revenue.summary?.totalRevenue)}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(processedStats.revenue.summary?.averagePrice)}
                    </div>
                    <p className="text-xs text-muted-foreground">Average Price</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-purple-600">
                      {processedStats.revenue.summary?.soldCount || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Properties Sold</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-orange-600">
                      {formatPercentage(15.2)}
                    </div>
                    <p className="text-xs text-muted-foreground">Growth Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trends</CardTitle>
              <CardDescription>Revenue performance over the last 12 months</CardDescription>
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
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Categories</CardTitle>
                <CardDescription>Distribution of users by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={chartData.userDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                      >
                        {chartData.userDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* User Engagement */}
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>Activity and retention metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Daily Active Users</span>
                    <span className="text-sm font-semibold">
                      {formatNumber(processedStats.userStats.userEngagement?.dailyActiveUsers)}
                    </span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Weekly Active Users</span>
                    <span className="text-sm font-semibold">
                      {formatNumber(processedStats.userStats.userEngagement?.weeklyActiveUsers)}
                    </span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Monthly Active Users</span>
                    <span className="text-sm font-semibold">
                      {formatNumber(processedStats.userStats.userEngagement?.monthlyActiveUsers)}
                    </span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Retention & Growth */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>User return rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Day 1</span>
                    <div className="flex items-center gap-2">
                      <Progress value={processedStats.userStats.userRetention?.day1 || 0} className="w-16 h-2" />
                      <span className="text-sm font-semibold">{processedStats.userStats.userRetention?.day1 || 0}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Day 7</span>
                    <div className="flex items-center gap-2">
                      <Progress value={processedStats.userStats.userRetention?.day7 || 0} className="w-16 h-2" />
                      <span className="text-sm font-semibold">{processedStats.userStats.userRetention?.day7 || 0}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Day 30</span>
                    <div className="flex items-center gap-2">
                      <Progress value={processedStats.userStats.userRetention?.day30 || 0} className="w-16 h-2" />
                      <span className="text-sm font-semibold">{processedStats.userStats.userRetention?.day30 || 0}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user acquisition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(processedStats.userStats.newUsersThisMonth)}
                    </div>
                    <p className="text-sm text-muted-foreground">New This Month</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <Badge variant={processedStats.userStats.userGrowthRate > 0 ? 'secondary' : 'destructive'}>
                      {processedStats.userStats.userGrowthRate > 0 ? '+' : ''}{processedStats.userStats.userGrowthRate}% growth
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
                <CardDescription>Currently active</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatNumber(processedStats.userStats.activeUsers)}
                    </div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-muted-foreground">Online now</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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

            {/* Property Status */}
            <Card>
              <CardHeader>
                <CardTitle>Property Status</CardTitle>
                <CardDescription>Current status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={chartData.propertyStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {chartData.propertyStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property Analytics Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatNumber(processedStats.overview.totalProperties)}</div>
                <p className="text-sm text-muted-foreground">All properties</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Featured</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{processedStats.propertyStats.featuredProperties}</div>
                <p className="text-sm text-muted-foreground">Featured properties</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(processedStats.propertyStats.averagePrice)}</div>
                <p className="text-sm text-muted-foreground">Market average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {processedStats.propertyStats.propertiesGrowthRate > 0 ? '+' : ''}{processedStats.propertyStats.propertiesGrowthRate}%
                </div>
                <p className="text-sm text-muted-foreground">vs last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Locations */}
          <Card>
            <CardHeader>
              <CardTitle>Top Locations</CardTitle>
              <CardDescription>Most popular property locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(processedStats.propertyStats.topLocations || []).slice(0, 5).map((location, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{location.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(location.count / (processedStats.propertyStats.topLocations[0]?.count || 1)) * 100} className="w-20 h-2" />
                      <span className="text-sm font-semibold">{location.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* System Resources */}
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
                <CardDescription>Current resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart data={chartData.systemMetrics}>
                      <RadialBar
                        minAngle={15}
                        label={{ position: 'insideStart', fill: '#fff' }}
                        background
                        clockWise
                        dataKey="value"
                      />
                      <Legend iconSize={18} layout="horizontal" verticalAlign="bottom" />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Database Health */}
            <Card>
              <CardHeader>
                <CardTitle>Database Health</CardTitle>
                <CardDescription>Database performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant="secondary">
                    {processedStats.systemHealth?.database?.status || 'healthy'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-sm font-semibold">
                    {processedStats.systemHealth?.database?.responseTime || 0}ms
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Connections</span>
                  <span className="text-sm font-semibold">
                    {processedStats.systemHealth.databaseConnections || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Sessions</span>
                  <span className="text-sm font-semibold">
                    {processedStats.systemHealth.activeSessions || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Uptime */}
          <Card>
            <CardHeader>
              <CardTitle>System Uptime</CardTitle>
              <CardDescription>System availability and uptime information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {processedStats.systemHealth?.uptime?.human || '0d 0h 0m'}
                  </div>
                  <p className="text-sm text-muted-foreground">Current Uptime</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPercentage(processedStats.overview.uptime)}
                  </div>
                  <p className="text-sm text-muted-foreground">Availability (30d)</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {processedStats.overview.responseTime}ms
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Agent Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>Top performing agents by success rate and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(processedStats.agentPerformance.agents || []).slice(0, 10).map((agent, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {(agent.fullname || 'A').charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{agent.fullname || 'Agent'}</div>
                        <div className="text-sm text-muted-foreground">{agent.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{agent.successRate?.toFixed(1)}% success</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(agent.totalRevenue || 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {agent.totalProperties} properties
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Newsletter Performance */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Newsletter Metrics</CardTitle>
                <CardDescription>Subscriber engagement and growth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(processedStats.newsletter.summary?.totalSubscribers)}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Subscribers</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatNumber(processedStats.newsletter.summary?.activeSubscribers)}
                    </div>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-purple-600">
                      {processedStats.newsletter.summary?.newSubscribers || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">New This Month</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-red-600">
                      {formatPercentage(processedStats.newsletter.summary?.unsubscribeRate)}
                    </div>
                    <p className="text-xs text-muted-foreground">Churn Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Performance</CardTitle>
                <CardDescription>Email campaign effectiveness</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Open Rate</span>
                    <span className="font-semibold">{formatPercentage(processedStats.emailStats.openRate)}</span>
                  </div>
                  <Progress value={processedStats.emailStats.openRate || 0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Click Rate</span>
                    <span className="font-semibold">{formatPercentage(processedStats.emailStats.clickRate)}</span>
                  </div>
                  <Progress value={processedStats.emailStats.clickRate || 0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-semibold">{formatPercentage(processedStats.emailStats.emailSuccessRate)}</span>
                  </div>
                  <Progress value={processedStats.emailStats.emailSuccessRate || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Real-time Metrics</CardTitle>
              <CardDescription>
                Live system metrics • Last updated: {processedStats.realtime.timestamp ? new Date(processedStats.realtime.timestamp).toLocaleTimeString() : 'N/A'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {processedStats.realtime.activeUsers || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {processedStats.realtime.recentProperties || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Recent Properties</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {processedStats.realtime.recentInquiries || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Recent Inquiries</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {typeof processedStats.realtime.systemLoad === 'number' ? 
                      `${processedStats.realtime.systemLoad.toFixed(1)}%` : 'N/A'}
                  </div>
                  <p className="text-sm text-muted-foreground">System Load</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Trending Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Trending Content & Performance
          </CardTitle>
          <CardDescription>Most popular and trending items across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            {['properties', 'locations', 'agents', 'blogs'].map((category) => {
              const items = Array.isArray(processedStats.trending[category]) ? processedStats.trending[category] : [];
              const categoryIcons = {
                properties: Home,
                locations: MapPin,
                agents: UserCheck,
                blogs: FileText
              };
              const Icon = categoryIcons[category];

              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium capitalize">{category}</h4>
                  </div>
                  <div className="space-y-2">
                    {items.length > 0 ? (
                      items.slice(0, 5).map((item, index) => (
                        <div key={index} className="text-sm p-2 bg-muted/50 rounded flex items-center justify-between">
                          <span className="truncate">{item.title || item.name || item.fullname || item._id || 'Item'}</span>
                          {item.count && (
                            <Badge variant="outline" className="text-xs">
                              {item.count}
                            </Badge>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        No trending {category}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}