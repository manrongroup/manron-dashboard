import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Send, Edit, Trash2, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailForm } from '@/components/EmailForm';
import { useAuth } from '@/contexts/AuthContext';
import { EmailTemplate } from '@/types';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import StatCard from '@/components/ui/stat-card';

export default function EmailManagement() {
  const { hasPermission } = useAuth();
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [bulkEmailSubject, setBulkEmailSubject] = useState('');
  const [bulkEmailMessage, setBulkEmailMessage] = useState('');
  const [bulkEmailCategory, setBulkEmailCategory] = useState('all');
  const [bulkEmailLoading, setBulkEmailLoading] = useState(false);

  useEffect(() => {
    fetchEmailTemplates();
  }, []);

  const fetchEmailTemplates = async () => {
    try {
      const response = await api.get('/email-templates');
      setEmailTemplates(response.data.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch email templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this email template?')) return;

    try {
      await api.delete(`/email-templates/${id}`);
      setEmailTemplates(emailTemplates.filter(template => template._id !== id));
      toast({
        title: 'Success',
        description: 'Email template deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete email template',
        variant: 'destructive',
      });
    }
  };

  const handleBulkEmail = async () => {
    if (!bulkEmailSubject.trim() || !bulkEmailMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter both subject and message',
        variant: 'destructive',
      });
      return;
    }

    setBulkEmailLoading(true);
    try {
      let endpoint = '/emails';
      if (bulkEmailCategory !== 'all') {
        endpoint = `/emails/categories/${bulkEmailCategory}`;
      }

      await api.post(endpoint, {
        subject: bulkEmailSubject,
        message: bulkEmailMessage,
      });

      toast({
        title: 'Success',
        description: `Bulk email sent successfully to ${bulkEmailCategory === 'all' ? 'all subscribers' : bulkEmailCategory + ' subscribers'}`,
      });

      setBulkEmailSubject('');
      setBulkEmailMessage('');
      setBulkEmailCategory('all');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send bulk email',
        variant: 'destructive',
      });
    } finally {
      setBulkEmailLoading(false);
    }
  };

  const filteredTemplates = emailTemplates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || template.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'newsletter': return 'bg-primary text-primary-foreground';
      case 'promotion': return 'bg-success text-success-foreground';
      case 'notification': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const stats = {
    totalTemplates: emailTemplates.length,
    newsletters: emailTemplates.filter(t => t.type === 'newsletter').length,
    promotions: emailTemplates.filter(t => t.type === 'promotion').length,
    notifications: emailTemplates.filter(t => t.type === 'notification').length,
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Management</h1>
        <p className="text-muted-foreground">Manage email templates and send bulk emails</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Templates"
          value={stats.totalTemplates}
          icon={Mail}
          trend={{ value: 0, isPositive: false }}
        />
        <StatCard
          title="Newsletters"
          value={stats.newsletters}
          icon={MessageSquare}
          trend={{ value: 0, isPositive: false }}
        />
        <StatCard
          title="Promotions"
          value={stats.promotions}
          icon={Send}
          trend={{ value: 0, isPositive: false }}
        />
        <StatCard
          title="Notifications"
          value={stats.notifications}
          icon={Users}
          trend={{ value: 0, isPositive: false }}
        />
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="bulk-email">Send Bulk Email</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Templates
                </CardTitle>
                {hasPermission('manage_content') && (
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create Email Template</DialogTitle>
                      </DialogHeader>
                      <EmailForm
                        onSubmit={() => {
                          setIsCreateDialogOpen(false);
                          fetchEmailTemplates();
                        }}
                        onCancel={() => setIsCreateDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTemplates.map((template) => (
                      <TableRow key={template._id}>
                        <TableCell>
                          <p className="font-medium">{template.name}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{template.subject}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={`capitalize ${getTypeColor(template.type)}`}>
                            {template.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground">{template.createdBy}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {hasPermission('manage_content') && (
                              <>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => setEditingTemplate(template)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Edit Email Template</DialogTitle>
                                    </DialogHeader>
                                    {editingTemplate && (
                                      <EmailForm
                                        template={editingTemplate}
                                        onSubmit={() => {
                                          setEditingTemplate(null);
                                          fetchEmailTemplates();
                                        }}
                                        onCancel={() => setEditingTemplate(null)}
                                      />
                                    )}
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(template._id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No email templates found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Bulk Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="bulk-category" className="text-sm font-medium mb-2 block">
                    Send To
                  </label>
                  <Select value={bulkEmailCategory} onValueChange={setBulkEmailCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subscribers</SelectItem>
                      <SelectItem value="real-estate">Real Estate Subscribers</SelectItem>
                      <SelectItem value="blog">Blog Subscribers</SelectItem>
                      <SelectItem value="newsletter">Newsletter Subscribers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="bulk-subject" className="text-sm font-medium mb-2 block">
                    Email Subject
                  </label>
                  <Input
                    id="bulk-subject"
                    placeholder="Enter email subject"
                    value={bulkEmailSubject}
                    onChange={(e) => setBulkEmailSubject(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bulk-message" className="text-sm font-medium mb-2 block">
                  Email Message
                </label>
                <div className="border rounded-lg">
                  <div className="p-4">
                    <textarea
                      id="bulk-message"
                      className="w-full h-64 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your email message here..."
                      value={bulkEmailMessage}
                      onChange={(e) => setBulkEmailMessage(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setBulkEmailSubject('');
                    setBulkEmailMessage('');
                    setBulkEmailCategory('all');
                  }}
                >
                  Clear
                </Button>
                <Button 
                  onClick={handleBulkEmail}
                  disabled={bulkEmailLoading || !bulkEmailSubject.trim() || !bulkEmailMessage.trim()}
                >
                  {bulkEmailLoading ? 'Sending...' : 'Send Email'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}