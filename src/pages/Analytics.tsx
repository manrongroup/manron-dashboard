import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatCard from '@/components/ui/stat-card';
import { BarChart3, Users, Eye, MousePointer, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const mockAnalyticsData = {
  overview: {
    totalVisitors: 15420,
    pageViews: 45890,
    bounceRate: 34.2,
    avgSessionDuration: '2m 45s'
  },
  weeklyData: [
    { day: 'Mon', visitors: 1200, pageViews: 3400, sessions: 890 },
    { day: 'Tue', visitors: 1500, pageViews: 4200, sessions: 1100 },
    { day: 'Wed', visitors: 1800, pageViews: 5100, sessions: 1300 },
    { day: 'Thu', visitors: 1600, pageViews: 4800, sessions: 1200 },
    { day: 'Fri', visitors: 2200, pageViews: 6200, sessions: 1600 },
    { day: 'Sat', visitors: 1900, pageViews: 5400, sessions: 1400 },
    { day: 'Sun', visitors: 1400, pageViews: 3900, sessions: 1000 }
  ],
  websiteData: [
    { name: 'Prime Properties', visitors: 5200, color: '#8b5cf6' },
    { name: 'Tech Blog', visitors: 3800, color: '#06b6d4' },
    { name: 'Corporate Site', visitors: 2900, color: '#10b981' },
    { name: 'Portfolio', visitors: 2100, color: '#f59e0b' },
    { name: 'News Portal', visitors: 1420, color: '#ef4444' }
  ],
  topPages: [
    { page: '/real-estate/luxury-homes', views: 2400, bounce: 28 },
    { page: '/blog/tech-trends-2024', views: 1890, bounce: 32 },
    { page: '/about', views: 1560, bounce: 45 },
    { page: '/contact', views: 1200, bounce: 38 },
    { page: '/services', views: 980, bounce: 42 }
  ]
};

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedWebsite, setSelectedWebsite] = useState('all');

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Track performance across all your websites
          </p>
        </div>
        
        <div className="flex gap-4">
          <Select value={selectedWebsite} onValueChange={setSelectedWebsite}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select website" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Websites</SelectItem>
              <SelectItem value="prime-properties">Prime Properties</SelectItem>
              <SelectItem value="tech-blog">Tech Blog</SelectItem>
              <SelectItem value="corporate">Corporate Site</SelectItem>
              <SelectItem value="portfolio">Portfolio</SelectItem>
              <SelectItem value="news">News Portal</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Visitors"
          value={mockAnalyticsData.overview.totalVisitors.toLocaleString()}
          icon={Users}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Page Views"
          value={mockAnalyticsData.overview.pageViews.toLocaleString()}
          icon={Eye}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Bounce Rate"
          value={`${mockAnalyticsData.overview.bounceRate}%`}
          icon={MousePointer}
          trend={{ value: 3.1, isPositive: false }}
        />
        <StatCard
          title="Avg. Session"
          value={mockAnalyticsData.overview.avgSessionDuration}
          icon={Calendar}
          trend={{ value: 5.4, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitors Trend */}
        <Card className="border-border/50 shadow-subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Visitors Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockAnalyticsData.weeklyData}>
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorVisitors)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Website Distribution */}
        <Card className="border-border/50 shadow-subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Traffic by Website
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockAnalyticsData.websiteData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="visitors"
                  >
                    {mockAnalyticsData.websiteData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page Views Chart */}
      <Card className="border-border/50 shadow-subtle">
        <CardHeader>
          <CardTitle>Page Views & Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockAnalyticsData.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="pageViews" fill="hsl(var(--primary))" />
                <Bar dataKey="sessions" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Pages */}
      <Card className="border-border/50 shadow-subtle">
        <CardHeader>
          <CardTitle>Top Performing Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalyticsData.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/50">
                <div className="flex-1">
                  <p className="font-medium">{page.page}</p>
                  <p className="text-sm text-muted-foreground">
                    {page.views.toLocaleString()} views • {page.bounce}% bounce rate
                  </p>
                </div>
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(page.views / 2400) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}