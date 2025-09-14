export interface User {
  _id:string;
  id: string;
  email: string;
  role: 'superAdmin' | 'admin' | 'worker' | 'user' | 'agent';
  fullname?: string;
  avatar?: string;
  telephone?: string;
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