import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  FileText,
  MessageSquare,
  Users,
  Building,
  Globe,
  TrendingUp,
  Activity
} from 'lucide-react';
import StatCard from '@/components/ui/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { Statistics, ActivityItem } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Statistics>({
    totalBlogs: 0,
    totalRealEstate: 0,
    totalContacts: 0,
    totalSubscribers: 0,
    totalUsers: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls with demo data
      setStats({
        totalBlogs: 45,
        totalRealEstate: 128,
        totalContacts: 89,
        totalSubscribers: 1250,
        totalUsers: 24,
        recentActivity: [
          {
            _id: '1',
            type: 'blog',
            action: 'created',
            description: 'New blog post "Future of Real Estate" published',
            user: 'John Doe',
            timestamp: new Date().toISOString()
          },
          {
            _id: '2',
            type: 'real-estate',
            action: 'updated',
            description: 'Property listing updated for downtown apartment',
            user: 'Jane Smith',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            _id: '3',
            type: 'contact',
            action: 'created',
            description: 'New inquiry received from potential buyer',
            user: 'System',
            timestamp: new Date(Date.now() - 7200000).toISOString()
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'blog': return FileText;
      case 'real-estate': return Building;
      case 'contact': return MessageSquare;
      case 'user': return Users;
      case 'email': return Activity;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'blog': return 'bg-blue-100 text-blue-800';
      case 'real-estate': return 'bg-green-100 text-green-800';
      case 'contact': return 'bg-orange-100 text-orange-800';
      case 'user': return 'bg-purple-100 text-purple-800';
      case 'email': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome back, {user?.name || user?.email}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening across your websites today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-primary">
            <TrendingUp className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Blogs"
          value={stats.totalBlogs}
          description="Published articles"
          icon={FileText}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Real Estate"
          value={stats.totalRealEstate}
          description="Active listings"
          icon={Building}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Contacts"
          value={stats.totalContacts}
          description="New inquiries"
          icon={MessageSquare}
          variant="warning"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Subscribers"
          value={stats.totalSubscribers}
          description="Email subscribers"
          icon={Users}
          variant="default"
          trend={{ value: 3, isPositive: false }}
        />
        <StatCard
          title="Websites"
          value={5}
          description="Active sites"
          icon={Globe}
          variant="default"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>
              Frequently used actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Create New Blog
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Building className="mr-2 h-4 w-4" />
              Add Property
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              Email Blast
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>
              Latest updates across all websites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity._id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>by {activity.user}</span>
                        <span>•</span>
                        <span>{new Date(activity.timestamp).toLocaleTimeString()}</span>
                        <Badge 
                          variant="secondary" 
                          className={`${getActivityColor(activity.type)} text-xs`}
                        >
                          {activity.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Website Status */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Website Status</CardTitle>
            <CardDescription>
              Monitor all your websites at a glance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {[
                { name: 'Real Estate Main', status: 'active', type: 'real-estate', visitors: '2.1K' },
                { name: 'Tech Blog', status: 'active', type: 'blog', visitors: '1.8K' },
                { name: 'News Portal', status: 'active', type: 'news', visitors: '3.2K' },
                { name: 'Portfolio Site', status: 'maintenance', type: 'portfolio', visitors: '0.9K' },
                { name: 'Corporate', status: 'active', type: 'corporate', visitors: '1.2K' },
              ].map((site, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      site.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-sm font-medium">{site.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{site.type}</p>
                  <p className="text-xs">
                    <span className="font-medium">{site.visitors}</span> visitors today
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}