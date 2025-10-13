export interface User {
  _id: string;
  id: string;
  email: string;
  role: 'superAdmin' | 'admin' | 'worker' | 'user' | 'agent';
  fullname?: string;
  avatar?: string;
  telephone?: string;
  isActive: boolean;
  lastLogin?: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  category: string;
  tags: string[];
  type: string;
  readTime: string;
  featured: boolean;
  image: string;
  images?: string[];
  status: 'draft' | 'published' | 'archived';
  views?: number;
  likes?: number;
  shares?: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RealEstate {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: 'apartment' | 'house' | 'commercial' | 'land';
  status: 'available' | 'sold' | 'rented' | 'pending';
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  images: string[];
  features: string[];
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  website: string;
  category: 'real-estate' | 'blog' | 'general';
  status: 'new' | 'contacted' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface Subscriber {
  _id: string;
  email: string;
  name?: string;
  website: string;
  status: 'active' | 'inactive';
  createdAt: string;
  categories: string[];
}

export interface Website {
  _id: string;
  name: string;
  domain: string;
  type: 'real-estate' | 'blog' | 'portfolio' | 'news' | 'corporate';
  status: 'active' | 'inactive';
  description: string;
}

export interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  content: string;
  type: 'newsletter' | 'promotion' | 'notification';
  createdBy: string;
}

export interface Statistics {
  totalBlogs: number;
  totalRealEstate: number;
  totalContacts: number;
  totalSubscribers: number;
  totalUsers: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  _id: string;
  type: 'blog' | 'real-estate' | 'contact' | 'user' | 'email';
  action: 'created' | 'updated' | 'deleted' | 'sent';
  description: string;
  user: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Enhanced Analytics Types
export interface AnalyticsOverview {
  totalUsers: number;
  totalProperties: number;
  totalBlogs: number;
  totalContacts: number;
  totalEmailsSent: number;
  activeAgents: number;
  publishedBlogs: number;
  pendingContacts: number;
  growthRate: number;
  conversionRate: number;
  revenue: number;
  monthlyRevenue: number;
  systemHealth: number;
  responseTime: number;
  uptime: number;
  errorRate: number;
}

export interface UserAnalytics {
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsers: number;
  userGrowthRate: number;
  usersByCategory: AnalyticsCategory[];
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
  };
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
}

export interface PropertyAnalytics {
  totalProperties: number;
  featuredProperties: number;
  recentProperties: number;
  propertiesGrowthRate: number;
  propertiesByStatus: AnalyticsCategory[];
  propertiesByType: AnalyticsCategory[];
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
  topLocations: AnalyticsCategory[];
}

export interface BlogAnalytics {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  blogGrowthRate: number;
  blogsByCategory: AnalyticsCategory[];
  recentBlogActivity: BlogActivity[];
  topPerformingBlogs: {
    _id: string;
    title: string;
    views: number;
    likes: number;
    shares: number;
  }[];
  contentPerformance: {
    averageReadTime: number;
    bounceRate: number;
    engagementRate: number;
  };
}

export interface ContactAnalytics {
  totalContacts: number;
  newContacts: number;
  resolvedContacts: number;
  pendingContacts: number;
  contactGrowthRate: number;
  contactsByStatus: AnalyticsCategory[];
  contactsByPriority: AnalyticsCategory[];
  contactTrends: ContactTrend[];
  responseTime: {
    average: number;
    median: number;
    p95: number;
  };
  conversionRate: number;
}

export interface EmailAnalytics {
  totalEmailsSent: number;
  successfulEmails: number;
  failedEmails: number;
  emailSuccessRate: number;
  emailsByCategory: AnalyticsCategory[];
  emailTrends: EmailTrend[];
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  bounceRate: number;
}

export interface SystemHealth {
  systemHealth: number;
  responseTime: number;
  uptime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  databaseConnections: number;
  activeSessions: number;
}

export interface AnalyticsCategory {
  name: string;
  value: number;
  color: string;
  percentage?: number;
}

export interface BlogActivity {
  date: string;
  published: number;
  drafts: number;
  views: number;
  likes: number;
}

export interface ContactTrend {
  date: string;
  new: number;
  resolved: number;
  pending: number;
  responseTime: number;
}

export interface EmailTrend {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
}

export interface RecentActivity {
  _id: string;
  type: 'user' | 'property' | 'blog' | 'contact' | 'email' | 'system';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high';
  user?: string;
  metadata?: Record<string, unknown>;
}

export interface TrendData {
  weekly: WeeklyTrend[];
  monthly: MonthlyTrend[];
  yearly: YearlyTrend[];
}

export interface WeeklyTrend {
  day: string;
  users: number;
  properties: number;
  blogs: number;
  contacts: number;
  emails: number;
  revenue: number;
}

export interface MonthlyTrend {
  month: string;
  users: number;
  properties: number;
  blogs: number;
  contacts: number;
  emails: number;
  revenue: number;
}

export interface YearlyTrend {
  year: string;
  users: number;
  properties: number;
  blogs: number;
  contacts: number;
  emails: number;
  revenue: number;
}

export interface AnalyticsFilters {
  dateRange: '24h' | '7d' | '30d' | '90d' | '1y' | 'custom';
  startDate?: string;
  endDate?: string;
  category?: string;
  status?: string;
  priority?: string;
  userRole?: string;
  propertyType?: string;
  blogCategory?: string;
}

export interface KPI {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  trend?: number;
  target?: number;
  description?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    fill?: boolean;
  }[];
}

// Security and Permissions
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  level: number;
  isSystem: boolean;
}

export interface SecurityEvent {
  _id: string;
  type: 'login' | 'logout' | 'permission_denied' | 'suspicious_activity' | 'data_access' | 'data_modification';
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  userAgent: string;
  resource?: string;
  action?: string;
  details: Record<string, unknown>;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Performance Monitoring
export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
  memoryUsage: number;
  cpuUsage: number;
  databaseQueryTime: number;
  cacheHitRate: number;
}

export interface AuditLog {
  _id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}