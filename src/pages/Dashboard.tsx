import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/contexts/AnalysisContext';
import StatCard from '@/components/ui/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  Home,
  FileText,
  Mail,
  UserCheck,
  TrendingUp,
  Activity,
  RefreshCw,
  Plus,
  Eye,
  MessageSquare,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Bell,
  Settings,
  Download,
  Zap,
  Shield,
  Database,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Percent
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  Pie,
  Legend
} from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, canAccess } = useAuth();
  const {
    stats: analyticsStats,
    loading: analyticsLoading,
    error: analyticsError,
    refreshStats,
    getRecentActivity,
    getNotifications,
    filters,
    setFilters
  } = useAnalytics();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [notifications] = useState(getNotifications());

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshStats();
    } finally {
      setRefreshing(false);
    }
  };

  const handleTimeRangeChange = (value: string) => {
    setSelectedTimeRange(value);
    setFilters({ dateRange: value as '24h' | '7d' | '30d' | '90d' | '1y' | 'custom' });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatPercentage = (value: number) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'blog': return FileText;
      case 'contact': return MessageSquare;
      case 'property': return Home;
      case 'email': return Mail;
      case 'user': return Users;
      default: return Activity;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getTrendIcon = (value: number) => {
    return value >= 0 ? ArrowUpRight : ArrowDownRight;
  };

  const getTrendColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  // Loading state
  if (analyticsLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="col-span-4 h-80" />
          <Skeleton className="col-span-3 h-80" />
        </div>
      </div>
    );
  }

  // Error state
  if (analyticsError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md text-center border-destructive">
          <CardHeader>
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Dashboard Error</CardTitle>
            <CardDescription className="text-muted-foreground">
              {analyticsError}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleRefresh} className="w-full" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <p className="text-xs text-muted-foreground">
              If the issue persists, contact system administrator
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const recentActivity = analyticsStats?.recentActivity || []
  const overview = analyticsStats?.overview;
  const subscribers = analyticsStats.newsletter
  const userStats = analyticsStats?.userStats;
  console.log(userStats);
  const propertyStats = analyticsStats?.propertyStats;
  const blogStats = analyticsStats?.blogStats;
  const contactStats = analyticsStats?.contactStats;

  // ================  recent activities ==========================




  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <span>Welcome back, {user?.fullname || 'User'}</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time range" />
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
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          {canAccess('analytics', 'read') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate('/analytics')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Full Analytics
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={formatNumber(overview?.totalUsers || 0)}
          description={`${userStats?.newUsersThisMonth || 0} new this month`}
          icon={Users}
          variant="primary"
          trend={{
            value: userStats?.userGrowthRate || 0,
            isPositive: (userStats?.userGrowthRate || 0) > 0,
            period: 'vs last month'
          }}
          badge={{
            text: `${formatNumber(userStats?.activeUsers || 0)} active`,
            variant: 'secondary'
          }}
          clickable
          onClick={() => canAccess('users', 'read') && handleNavigate('/users')}
        />

        <StatCard
          title="Properties"
          value={formatNumber(overview?.totalProperties || 0)}
          description={`${propertyStats?.featuredProperties || 0} featured`}
          icon={Home}
          variant="success"
          trend={{
            value: propertyStats?.propertiesGrowthRate || 0,
            isPositive: (propertyStats?.propertiesGrowthRate || 0) > 0,
            period: 'vs last month'
          }}
          badge={{
            text: formatCurrency(propertyStats?.averagePrice || 0),
            variant: 'outline'
          }}
          clickable
          onClick={() => canAccess('properties', 'read') && handleNavigate('/real-estate')}
        />

        <StatCard
          title="Blog Posts"
          value={formatNumber(overview?.totalBlogs || 0)}
          description={`${blogStats?.publishedBlogs || 0} published`}
          icon={FileText}
          variant="info"
          trend={{
            value: blogStats?.blogGrowthRate || 0,
            isPositive: (blogStats?.blogGrowthRate || 0) > 0,
            period: 'vs last month'
          }}
          badge={{
            text: `${blogStats?.draftBlogs || 0} drafts`,
            variant: 'secondary'
          }}
          clickable
          onClick={() => canAccess('blogs', 'read') && handleNavigate('/blogs')}
        />

        <StatCard
          title="Subscribers"
          value={formatNumber(subscribers?.summary?.totalSubscribers || 0)}
          description={`${formatNumber(subscribers?.summary?.activeSubscribers || 0)} active subscribers`}
          icon={MessageSquare}
          variant="warning"
          trend={{
            value: subscribers?.summary?.newSubscribers || 0, // can represent new subscribers as trend
            isPositive: (subscribers?.summary?.newSubscribers || 0) > 0,
            period: 'vs last month'
          }}
          clickable
          onClick={() => canAccess('newsletter', 'read') && handleNavigate('/newsletter')}
        />


      </div>




      {/* Enhanced Quick Actions and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
            <CardDescription>Frequently used shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {canAccess('properties', 'create') && (
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-accent transition-colors"
                onClick={() => handleNavigate('/real-estate')}
              >
                <Plus className="h-4 w-4 mr-3" />
                Add New Property
              </Button>
            )}
            {canAccess('blogs', 'create') && (
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-accent transition-colors"
                onClick={() => handleNavigate('/blogs')}
              >
                <FileText className="h-4 w-4 mr-3" />
                Write Blog Post
              </Button>
            )}
            {canAccess('contacts', 'read') && (
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-accent transition-colors"
                onClick={() => handleNavigate('/contacts')}
              >
                <MessageSquare className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">View Inquiries</span>
                {contactStats?.pendingContacts > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {contactStats.pendingContacts}
                  </Badge>
                )}
              </Button>
            )}
            {canAccess('emails', 'create') && (
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-accent transition-colors"
                onClick={() => handleNavigate('/emails')}
              >
                <Mail className="h-4 w-4 mr-3" />
                Send Newsletter
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-accent transition-colors"
              onClick={() => handleNavigate('/analytics')}
            >
              <Download className="h-4 w-4 mr-3" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest system events and updates</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => console.log("view all clicked")}>
              <Eye className="h-4 w-4 mr-1" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((activity, index) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div
                        key={activity._id || index}
                        className="flex items-start space-x-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <Icon className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-medium leading-none truncate">{activity.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span className="truncate max-w-20">{activity.user}</span>
                            <span>•</span>
                            <span>
                              {new Date(activity.timestamp).toISOString().slice(0, 16).replace('T', ' ')}
                            </span>
                            {activity.priority && (
                              <>
                                <span>•</span>
                                <Badge
                                  variant={getPriorityColor(activity.priority) as "default" | "secondary" | "destructive" | "outline"}
                                  className="text-xs px-1 py-0"
                                >
                                  {activity.priority}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No recent activity</p>
                  <p className="text-sm">System events will appear here</p>
                </div>
              )}
            </div>
          </CardContent>

        </Card>
      </div>

      {/* Enhanced Notifications */}
      {notifications && notifications.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800 dark:text-orange-200">
              <Bell className="h-5 w-5 mr-2" />
              System Notifications
              <Badge variant="secondary" className="ml-2">
                {notifications.length}
              </Badge>
            </CardTitle>
            <CardDescription>Important alerts and updates requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start space-x-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {notification.type === 'error' && (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    )}
                    {notification.type === 'warning' && (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    )}
                    {notification.type === 'info' && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium leading-tight">
                        {notification.title}
                      </p>
                      <Badge
                        variant={getPriorityColor(notification.priority) as "default" | "secondary" | "destructive" | "outline"}
                        className="text-xs"
                      >
                        {notification.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(notification.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}