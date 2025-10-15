import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Permission, Role, SecurityEvent } from '@/types';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  canAccess: (resource: string, action: string) => boolean;
  getAvailablePermissions: () => string[];
  logSecurityEvent: (event: Omit<SecurityEvent, '_id' | 'timestamp'>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Role hierarchy and permissions
const ROLE_HIERARCHY = {
  superAdmin: 4,
  admin: 3,
  agent: 2,
  worker: 1,
  user: 0
};

const PERMISSIONS: Record<string, string[]> = {
  superAdmin: [
    'all',
    'manage_users',
    'manage_agents',
    'manage_content',
    'manage_properties',
    'manage_blogs',
    'manage_contacts',
    'manage_emails',
    'view_analytics',
    'export_data',
    'system_settings',
    'audit_logs',
    'security_management'
  ],
  admin: [
    'manage_content',
    'manage_properties',
    'manage_blogs',
    'manage_contacts',
    'manage_emails',
    'view_analytics',
    'export_data',
    'system_settings',
    'audit_logs',
    'security_management'
  ],
  client: [
    'manage_users',
    'manage_agents',
    'manage_content',
    'manage_properties',
    'manage_blogs',
    'manage_contacts',
    'manage_emails',
    'view_analytics',
    'export_data'
  ],
  agent: [
    'manage_properties',
    'manage_contacts',
    'view_analytics',
    'manage_own_content'
  ],
  worker: [
    'manage_content',
    'manage_contacts',
    'view_basic_analytics'
  ],
  user: [
    'view_content',
    'view_own_data'
  ]
};

const RESOURCE_ACTIONS: Record<string, string[]> = {
  users: ['create', 'read', 'update', 'delete', 'manage'],
  agents: ['create', 'read', 'update', 'delete', 'manage'],
  properties: ['create', 'read', 'update', 'delete', 'manage', 'feature'],
  blogs: ['create', 'read', 'update', 'delete', 'publish', 'manage'],
  contacts: ['create', 'read', 'update', 'delete', 'assign', 'resolve'],
  emails: ['create', 'read', 'update', 'delete', 'send', 'manage'],
  analytics: ['view', 'export', 'manage'],
  settings: ['view', 'update', 'manage'],
  audit: ['view', 'export']
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        logSecurityEvent({
          type: 'suspicious_activity',
          ipAddress: 'unknown',
          userAgent: navigator.userAgent,
          details: { error: 'Invalid user data in localStorage' },
          severity: 'medium'
        });
      }
    }
    setIsLoading(false);
  }, []);

  const logSecurityEvent = (event: Omit<SecurityEvent, '_id' | 'timestamp'>) => {
    const securityEvent: SecurityEvent = {
      ...event,
      _id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: user?._id,
      userEmail: user?.email
    };

    // Log to console in development, send to API in production
    if (process.env.NODE_ENV === 'development') {
      console.log('Security Event:', securityEvent);
    } else {
      // In production, send to security logging endpoint
      api.post('/security/log', securityEvent).catch(console.error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post('/login', { email, password });

      const { token, user: userData } = response.data.data;
      console.log(token, userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      // Log successful login
      logSecurityEvent({
        type: 'login',
        ipAddress: 'unknown', // Would be provided by backend
        userAgent: navigator.userAgent,
        details: { email, loginTime: new Date().toISOString() },
        severity: 'low'
      });

      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || 'Login failed';

      // Log failed login attempt
      logSecurityEvent({
        type: 'suspicious_activity',
        ipAddress: 'unknown',
        userAgent: navigator.userAgent,
        details: { email, error: message, attemptTime: new Date().toISOString() },
        severity: 'medium'
      });

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Log logout event
    logSecurityEvent({
      type: 'logout',
      ipAddress: 'unknown',
      userAgent: navigator.userAgent,
      details: { logoutTime: new Date().toISOString() },
      severity: 'low'
    });

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast({
      title: 'Success',
      description: 'Logged out successfully',
    });
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    const userPermissions = PERMISSIONS[user.role] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;

    const userLevel = ROLE_HIERARCHY[user.role as keyof typeof ROLE_HIERARCHY] || 0;
    const requiredLevel = ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] || 0;

    return userLevel >= requiredLevel;
  };

  const canAccess = (resource: string, action: string): boolean => {
    if (!user) return false;

    // Super admin can access everything
    if (user.role === 'superAdmin' || user.role === 'admin') return true;

    // Check if user has permission for the resource
    const resourcePermission = `manage_${resource}`;
    if (hasPermission(resourcePermission)) return true;

    // Check specific action permissions
    const actionPermission = `${action}_${resource}`;
    if (hasPermission(actionPermission)) return true;

    // Check if action is allowed for the resource
    const allowedActions = RESOURCE_ACTIONS[resource] || [];
    if (!allowedActions.includes(action)) return false;

    // Check role-based access
    switch (user.role) {
      case 'admin':
        return ['users', 'agents', 'properties', 'blogs', 'contacts', 'emails', 'analytics'].includes(resource);
      case 'agent':
        return ['properties', 'contacts', 'analytics'].includes(resource) &&
          ['read', 'create', 'update'].includes(action);
      case 'worker':
        return ['blogs', 'contacts'].includes(resource) &&
          ['read', 'create', 'update'].includes(action);
      case 'user':
        return ['properties', 'blogs'].includes(resource) && action === 'read';
      default:
        return false;
    }
  };

  const getAvailablePermissions = (): string[] => {
    if (!user) return [];
    return PERMISSIONS[user.role] || [];
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // If refresh fails, user might need to login again
      logout();
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    hasPermission,
    hasRole,
    canAccess,
    getAvailablePermissions,
    logSecurityEvent,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};