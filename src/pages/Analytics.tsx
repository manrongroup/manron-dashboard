import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
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
  Database
} from 'lucide-react';
import {
  LineChart,
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
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshStats();
    } finally {
      setRefreshing(false);
    }
  };

  const handleDateRangeChange = (value: string) => {
    setFilters({ dateRange: value as any });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'users': return Users;
      case 'properties': return Home;
      case 'blogs': return FileText;
      case 'contacts': return MessageSquare;
      case 'emails': return Mail;
      default: return Activity;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Comprehensive system analytics and insights</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Error Loading Analytics</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const kpis = getKPIs();
  const chartData = getChartData(selectedMetric as any);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive system analytics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-40">
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.slice(0, 4).map((kpi, index) => (
          <StatCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            description={kpi.description}
            icon={getMetricIcon((kpi as any).category || 'overview')}
            variant={kpi.isPositive ? 'success' : 'warning'}
            trend={{
              value: (kpi as any).change || 0,
              isPositive: kpi.isPositive,
              period: (kpi as any).period || 'vs previous period'
            }}
            badge={(kpi as any).badge ? { text: (kpi as any).badge, variant: 'secondary' } : undefined}
          />
        ))}
      </div>

      {/* System Health Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.systemHealth || 0}%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Progress value={stats?.overview?.systemHealth || 0} className="flex-1" />
              <span>{stats?.overview?.systemHealth > 95 ? 'Excellent' : 'Good'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.responseTime || 0}ms</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.uptime || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.overview?.errorRate || 0).toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              System errors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Activity Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Trends</CardTitle>
            <CardDescription>User and property activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.trendsData?.weekly || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stackId="1"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="properties"
                    stackId="1"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="blogs"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Breakdown by user categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.userStats?.usersByCategory || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(stats?.userStats?.usersByCategory || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Property Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Property Analytics</CardTitle>
            <CardDescription>Property performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Properties</span>
                <span className="text-2xl font-bold">{formatNumber(stats?.overview?.totalProperties || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Featured</span>
                <span className="text-lg font-semibold">{stats?.propertyStats?.featuredProperties || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Growth Rate</span>
                <Badge variant={stats?.propertyStats?.propertiesGrowthRate > 0 ? 'secondary' : 'destructive'}>
                  {stats?.propertyStats?.propertiesGrowthRate > 0 ? '+' : ''}{stats?.propertyStats?.propertiesGrowthRate || 0}%
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Properties by Type</span>
                </div>
                {(stats?.propertyStats?.propertiesByType || []).slice(0, 3).map((type, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{type.name}</span>
                    <span className="text-sm font-medium">{type.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blog Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Blog Analytics</CardTitle>
            <CardDescription>Content performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Posts</span>
                <span className="text-2xl font-bold">{formatNumber(stats?.overview?.totalBlogs || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Published</span>
                <span className="text-lg font-semibold">{stats?.blogStats?.publishedBlogs || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Drafts</span>
                <span className="text-lg font-semibold">{stats?.blogStats?.draftBlogs || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Growth Rate</span>
                <Badge variant={stats?.blogStats?.blogGrowthRate > 0 ? 'secondary' : 'destructive'}>
                  {stats?.blogStats?.blogGrowthRate > 0 ? '+' : ''}{stats?.blogStats?.blogGrowthRate || 0}%
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Content Performance</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg. Read Time</span>
                  <span className="text-sm font-medium">{stats?.blogStats?.contentPerformance?.averageReadTime || 0} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Engagement Rate</span>
                  <span className="text-sm font-medium">{stats?.blogStats?.contentPerformance?.engagementRate || 0}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Analytics</CardTitle>
            <CardDescription>Inquiry and response metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Inquiries</span>
                <span className="text-2xl font-bold">{formatNumber(stats?.overview?.totalContacts || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">New</span>
                <span className="text-lg font-semibold">{stats?.contactStats?.newContacts || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Resolved</span>
                <span className="text-lg font-semibold">{stats?.contactStats?.resolvedContacts || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending</span>
                <span className="text-lg font-semibold">{stats?.contactStats?.pendingContacts || 0}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Response Time</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average</span>
                  <span className="text-sm font-medium">{stats?.contactStats?.responseTime?.average || 0} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <span className="text-sm font-medium">{stats?.contactStats?.conversionRate || 0}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Analytics */}
      {stats?.overview?.revenue && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>Financial performance and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(stats.overview.revenue)}
                </div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(stats.overview.monthlyRevenue)}
                </div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {stats.overview.conversionRate}%
                </div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}