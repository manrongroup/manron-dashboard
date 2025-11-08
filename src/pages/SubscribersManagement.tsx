import React, { useState, useEffect } from 'react';
import { Users, Mail, Globe, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Subscriber } from '@/types';
import { api } from '@/lib/api';
import StatCard from '@/components/ui/stat-card';
import SubscribersTable from '@/components/tables/SubscribeTable';
import { toast } from 'sonner';
import RichTextEditor from '@/components/RichTextEditor';

export default function SubscribersManagement() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [websiteFilter, setWebsiteFilter] = useState<string>('all');
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [viewSubscriber, setViewSubscriber] = useState<Subscriber | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await api.get('/newsletter');
      setSubscribers(response.data || []);
    } catch (error: any) {
      // Don't let 401 errors from this endpoint trigger logout
      // Just show error and set empty array
      if (error.response?.status === 401) {
        setSubscribers([]);
        toast.error('Access denied. Please check your permissions.');
      } else {
        toast.error('Failed to fetch subscribers');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) return;

    try {
      await api.delete(`newsletter/${id}`);
      setSubscribers(subscribers.filter(subscriber => subscriber._id !== id));
      toast.success('Subscriber deleted successfully');
    } catch (error) {
      toast.error('Failed to delete subscriber');
    }
  };

  const handleSendEmail = async () => {
    if (!emailMessage.trim() || !emailSubject.trim()) {
      toast.error('Please enter both subject and message');
      return;
    }

    setEmailLoading(true);
    try {
      if (selectedSubscribers.length > 0) {
        // Send one by one to selected subscribers
        await Promise.all(
          selectedSubscribers.map(id =>
            api.post(`/emails/${id}`, {
              subject: emailSubject,
              message: emailMessage,
            })
          )
        );
        toast.success(`Email sent to ${selectedSubscribers.length} subscriber(s)`);
      } else {
        // Send to ALL (backend handles companies, interns, etc.)
        await api.post('/emails', {
          subject: emailSubject,
          message: emailMessage,
        });
        toast.success('Email sent to all subscribers successfully');
      }

      setIsEmailDialogOpen(false);
      setEmailMessage('');
      setEmailSubject('');
      setSelectedSubscribers([]);
    } catch (error) {
      toast.error('Failed to send email. Please try again later.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSelectSubscriber = (subscriber: any) => {
    setSelectedSubscribers(prev =>
      prev.includes(subscriber._id) ? prev.filter(subId => subId !== subscriber._id) : [...prev, subscriber._id]
    );
  };

  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesSearch =
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter;
    const matchesWebsite = websiteFilter === 'all' || subscriber.website === websiteFilter;
    return matchesSearch && matchesStatus && matchesWebsite;
  });

  const stats = {
    total: subscribers.length,
    active: subscribers.filter(s => s.status === 'active').length,
    inactive: subscribers.filter(s => s.status === 'inactive').length,
    thisMonth: subscribers.filter(s =>
      new Date(s.createdAt).getMonth() === new Date().getMonth() &&
      new Date(s.createdAt).getFullYear() === new Date().getFullYear()
    ).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriber Management</h1>
          <p className="text-muted-foreground">Manage newsletter subscribers from all websites</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  Send Email to {selectedSubscribers.length > 0
                    ? `${selectedSubscribers.length} Selected Subscribers`
                    : 'All Subscribers'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input
                    placeholder="Enter email subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>
                <div className=' p-5'>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <RichTextEditor
                    value={emailMessage}
                    onChange={setEmailMessage}
                    placeholder="Write your email..."
                    height="250px"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendEmail} disabled={emailLoading}>
                    {emailLoading ? 'Sending...' : 'Send Email'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Subscribers" value={stats.total} icon={Users} trend={{ value: 0, isPositive: false }} />
        <StatCard title="Active Subscribers" value={stats.active} icon={Mail} trend={{ value: 0, isPositive: false }} />
        <StatCard title="Inactive Subscribers" value={stats.inactive} icon={Users} trend={{ value: 0, isPositive: false }} />
        <StatCard title="This Month" value={stats.thisMonth} icon={Globe} trend={{ value: 0, isPositive: true }} />
      </div>

      <SubscribersTable
        subscribers={filteredSubscribers}
        onDelete={handleDelete}
        onEdit={handleSelectSubscriber}
        onView={(subscriber) => {
          const fullSubscriber = subscribers.find(s => s._id === subscriber._id) || subscriber;
          setViewSubscriber(fullSubscriber as Subscriber);
        }}
      />

      {/* View Subscriber Details Dialog */}
      <Dialog open={!!viewSubscriber} onOpenChange={() => setViewSubscriber(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subscriber Details</DialogTitle>
          </DialogHeader>
          {viewSubscriber && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-base">
                    <a href={`mailto:${viewSubscriber.email}`} className="text-blue-600 hover:underline">
                      {viewSubscriber.email}
                    </a>
                  </p>
                </div>
                {viewSubscriber.name && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-base font-semibold">{viewSubscriber.name}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Website</label>
                  <p className="text-base">{viewSubscriber.website || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-base">
                    <Badge variant={viewSubscriber.status === 'active' ? 'default' : 'secondary'}>
                      {viewSubscriber.status}
                    </Badge>
                  </p>
                </div>
                {viewSubscriber.categories && viewSubscriber.categories.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Categories</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {viewSubscriber.categories.map((cat, idx) => (
                        <Badge key={idx} variant="outline">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="text-base">
                    {new Date(viewSubscriber.createdAt).toLocaleString()}
                  </p>
                </div>
                {(viewSubscriber as any).updatedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                    <p className="text-base">
                      {new Date((viewSubscriber as any).updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
