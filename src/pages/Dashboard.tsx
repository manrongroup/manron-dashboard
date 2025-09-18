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
  Database
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
  Pie
} from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, canAccess } = useAuth();
  const {
    stats: analyticsStats,
    loading: analyticsLoading,
    error: analyticsError,
    refreshStats,
    getRecentActivity,
    getNotifications
  } = useAnalytics();

  const [refreshing, setRefreshing] = useState(false);
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
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (analyticsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.fullname || 'User'}</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="col-span-4 h-80" />
          <Skeleton className="col-span-3 h-80" />
        </div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
            <CardDescription>
              {analyticsError}
            </CardDescription>
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

  const recentActivity = getRecentActivity();
  const systemHealth = analyticsStats?.overview?.systemHealth || 0;
  const responseTime = analyticsStats?.overview?.responseTime || 0;
  const uptime = analyticsStats?.overview?.uptime || 0;
  const errorRate = analyticsStats?.overview?.errorRate || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.fullname || 'User'} • {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {canAccess('analytics', 'read') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate('/analytics')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={formatNumber(analyticsStats?.overview?.totalUsers || 0)}
          description="Registered users"
          icon={Users}
          variant="primary"
          trend={{
            value: analyticsStats?.userStats?.userGrowthRate || 0,
            isPositive: (analyticsStats?.userStats?.userGrowthRate || 0) > 0,
            period: 'vs last month'
          }}
          badge={{ text: 'Active', variant: 'secondary' }}
          clickable
          onClick={() => canAccess('users', 'read') && handleNavigate('/users')}
        />

        <StatCard
          title="Properties"
          value={formatNumber(analyticsStats?.overview?.totalProperties || 0)}
          description="Listed properties"
          icon={Home}
          variant="primary"
          trend={{
            value: analyticsStats?.propertyStats?.propertiesGrowthRate || 0,
            isPositive: (analyticsStats?.propertyStats?.propertiesGrowthRate || 0) > 0,
            period: 'vs last month'
          }}
          badge={{ text: 'Featured', variant: 'secondary' }}
          clickable
          onClick={() => canAccess('properties', 'read') && handleNavigate('/real-estate')}
        />

        <StatCard
          title="Blog Posts"
          value={formatNumber(analyticsStats?.overview?.totalBlogs || 0)}
          description="Published articles"
          icon={FileText}
          variant="info"
          trend={{
            value: analyticsStats?.blogStats?.blogGrowthRate || 0,
            isPositive: (analyticsStats?.blogStats?.blogGrowthRate || 0) > 0,
            period: 'vs last month'
          }}
          badge={{ text: 'Published', variant: 'secondary' }}
          clickable
          onClick={() => canAccess('blogs', 'read') && handleNavigate('/blogs')}
        />

        <StatCard
          title="Contact Inquiries"
          value={formatNumber(analyticsStats?.overview?.totalContacts || 0)}
          description="New inquiries"
          icon={MessageSquare}
          variant="primary"
          trend={{
            value: analyticsStats?.contactStats?.contactGrowthRate || 0,
            isPositive: (analyticsStats?.contactStats?.contactGrowthRate || 0) > 0,
            period: 'vs last month'
          }}
          badge={{ text: 'Pending', variant: 'destructive' }}
          clickable
          onClick={() => canAccess('contacts', 'read') && handleNavigate('/contacts')}
        />
      </div>

      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth}%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Progress value={systemHealth} className="flex-1" />
              <span>{systemHealth > 95 ? 'Excellent' : systemHealth > 85 ? 'Good' : 'Needs Attention'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              {responseTime < 200 ? 'Fast' : responseTime < 500 ? 'Good' : 'Slow'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uptime}%</div>
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
            <div className="text-2xl font-bold">{errorRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              {errorRate < 1 ? 'Low' : errorRate < 3 ? 'Medium' : 'High'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Activity Trends */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Activity Trends</CardTitle>
            <CardDescription>User and property activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsStats?.trendsData?.weekly || []}>
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
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>User categories breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={analyticsStats?.userStats?.usersByCategory || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(analyticsStats?.userStats?.usersByCategory || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {canAccess('properties', 'create') && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleNavigate('/real-estate')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            )}
            {canAccess('blogs', 'create') && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleNavigate('/blogs')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Write Blog Post
              </Button>
            )}
            {canAccess('contacts', 'read') && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleNavigate('/contacts')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                View Inquiries
              </Button>
            )}
            {canAccess('emails', 'create') && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleNavigate('/emails')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Newsletter
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity, index) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity._id || index} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{activity.user}</span>
                          <span>•</span>
                          <span>{new Date(activity.timestamp).toLocaleString()}</span>
                          {activity.priority && (
                            <>
                              <span>•</span>
                              <Badge variant={getPriorityColor(activity.priority) as any} className="text-xs">
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
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
            <CardDescription>System alerts and important updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border"
                >
                  <div className="flex-shrink-0">
                    {notification.type === 'error' && (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    )}
                    {notification.type === 'warning' && (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    {notification.type === 'info' && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{new Date(notification.timestamp).toLocaleString()}</span>
                      <Badge variant={getPriorityColor(notification.priority) as any}>
                        {notification.priority}
                      </Badge>
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