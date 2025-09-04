import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, Mail, Globe, Trash2, Send, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { Subscriber } from '@/types';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import StatCard from '@/components/ui/stat-card';

export default function SubscribersManagement() {
  const { hasPermission } = useAuth();
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

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await api.get('/subscribers');
      setSubscribers(response.data.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch subscribers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) return;

    try {
      await api.delete(`/subscribers/${id}`);
      setSubscribers(subscribers.filter(subscriber => subscriber._id !== id));
      toast({
        title: 'Success',
        description: 'Subscriber deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete subscriber',
        variant: 'destructive',
      });
    }
  };

  const handleBulkEmail = async () => {
    if (!emailMessage.trim() || !emailSubject.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter both subject and message',
        variant: 'destructive',
      });
      return;
    }

    setEmailLoading(true);
    try {
      if (selectedSubscribers.length > 0) {
        // Send to selected subscribers
        await api.post('/emails/bulk', {
          subscriberIds: selectedSubscribers,
          subject: emailSubject,
          message: emailMessage,
        });
      } else {
        // Send to all active subscribers
        await api.post('/emails/subscribers', {
          subject: emailSubject,
          message: emailMessage,
        });
      }

      toast({
        title: 'Success',
        description: `Email sent to ${selectedSubscribers.length > 0 ? selectedSubscribers.length : 'all'} subscribers`,
      });
      
      setIsEmailDialogOpen(false);
      setEmailMessage('');
      setEmailSubject('');
      setSelectedSubscribers([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send emails',
        variant: 'destructive',
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleExportSubscribers = () => {
    const csvData = filteredSubscribers.map(sub => ({
      Name: sub.name || '',
      Email: sub.email,
      Website: sub.website,
      Status: sub.status,
      'Subscribed Date': new Date(sub.subscribedAt).toLocaleDateString(),
      Categories: sub.categories.join(', ')
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'subscribers.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSelectSubscriber = (id: string) => {
    setSelectedSubscribers(prev => 
      prev.includes(id) 
        ? prev.filter(subId => subId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubscribers(filteredSubscribers.map(sub => sub._id));
    } else {
      setSelectedSubscribers([]);
    }
  };

  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      new Date(s.subscribedAt).getMonth() === new Date().getMonth()
    ).length,
  };

  const uniqueWebsites = [...new Set(subscribers.map(s => s.website))];

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
          <Button variant="outline" onClick={handleExportSubscribers}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          {hasPermission('manage_content') && (
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    Send Email to {selectedSubscribers.length > 0 
                      ? `${selectedSubscribers.length} Selected Subscribers` 
                      : 'All Active Subscribers'
                    }
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
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea
                      placeholder="Enter your email message..."
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      rows={8}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkEmail} disabled={emailLoading}>
                      {emailLoading ? 'Sending...' : 'Send Email'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Subscribers"
          value={stats.total}
          icon={Users}
          trend={{ value: 0, isPositive: false }}
        />
        <StatCard
          title="Active Subscribers"
          value={stats.active}
          icon={Mail}
          trend={{ value: 0, isPositive: false }}
        />
        <StatCard
          title="Inactive Subscribers"
          value={stats.inactive}
          icon={Users}
          trend={{ value: 0, isPositive: false }}
        />
        <StatCard
          title="This Month"
          value={stats.thisMonth}
          icon={Globe}
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Newsletter Subscribers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={websiteFilter} onValueChange={setWebsiteFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by website" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Websites</SelectItem>
                {uniqueWebsites.map(website => (
                  <SelectItem key={website} value={website}>{website}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSubscribers.length > 0 && (
            <div className="mb-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm">
                {selectedSubscribers.length} subscriber(s) selected
                <Button
                  variant="link"
                  className="p-0 ml-2 h-auto"
                  onClick={() => setSelectedSubscribers([])}
                >
                  Clear selection
                </Button>
              </p>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Subscriber</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSubscribers.includes(subscriber._id)}
                        onCheckedChange={() => handleSelectSubscriber(subscriber._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{subscriber.name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{subscriber.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{subscriber.website}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {subscriber.categories.map((category) => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={subscriber.status === 'active' 
                          ? 'bg-success text-success-foreground' 
                          : 'bg-secondary text-secondary-foreground'
                        }
                      >
                        {subscriber.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {hasPermission('manage_content') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(subscriber._id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredSubscribers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No subscribers found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}