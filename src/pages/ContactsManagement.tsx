import React, { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, Mail, Phone, Globe, Eye, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { Contact } from '@/types';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import StatCard from '@/components/ui/stat-card';

export default function ContactsManagement() {
  const { hasPermission } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/contacts');
      setContacts(response.data.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch contacts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'new' | 'contacted' | 'resolved') => {
    try {
      await api.patch(`/contacts/${id}`, { status });
      setContacts(contacts.map(contact => 
        contact._id === id ? { ...contact, status } : contact
      ));
      toast({
        title: 'Success',
        description: 'Contact status updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update contact status',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;

    try {
      await api.delete(`/contacts/${id}`);
      setContacts(contacts.filter(contact => contact._id !== id));
      toast({
        title: 'Success',
        description: 'Contact deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete contact',
        variant: 'destructive',
      });
    }
  };

  const handleReply = async () => {
    if (!selectedContact || !replyMessage.trim()) return;

    setReplyLoading(true);
    try {
      await api.post(`/emails/${selectedContact._id}`, {
        message: replyMessage,
        subject: `Re: ${selectedContact.message.substring(0, 50)}...`
      });
      
      // Update contact status to contacted
      await handleStatusUpdate(selectedContact._id, 'contacted');
      
      toast({
        title: 'Success',
        description: 'Reply sent successfully',
      });
      
      setSelectedContact(null);
      setReplyMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive',
      });
    } finally {
      setReplyLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || contact.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-primary text-primary-foreground';
      case 'contacted': return 'bg-secondary text-secondary-foreground';
      case 'resolved': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'real-estate': return <Globe className="w-4 h-4" />;
      case 'blog': return <MessageSquare className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const stats = {
    total: contacts.length,
    new: contacts.filter(c => c.status === 'new').length,
    contacted: contacts.filter(c => c.status === 'contacted').length,
    resolved: contacts.filter(c => c.status === 'resolved').length,
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
        <h1 className="text-3xl font-bold tracking-tight">Contact Management</h1>
        <p className="text-muted-foreground">Manage contact submissions from all websites</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Contacts"
          value={stats.total}
          icon={MessageSquare}
          trend={{ value: 0, isPositive: false }}
        />
        <StatCard
          title="New Contacts"
          value={stats.new}
          icon={Mail}
          trend={{ value: 0, isPositive: false }}
        />
        <StatCard
          title="Contacted"
          value={stats.contacted}
          icon={Phone}
          trend={{ value: 0, isPositive: false }}
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle}
          trend={{ value: 0, isPositive: false }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Contact Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
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
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="real-estate">Real Estate</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact Details</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                        {contact.phone && (
                          <p className="text-sm text-muted-foreground">{contact.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(contact.category)}
                        <Badge variant="outline" className="capitalize">
                          {contact.category.replace('-', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{contact.website}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`capitalize ${getStatusColor(contact.status)}`}>
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedContact(contact)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Contact Details</DialogTitle>
                            </DialogHeader>
                            {selectedContact && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="font-medium">Name</p>
                                    <p className="text-muted-foreground">{selectedContact.name}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Email</p>
                                    <p className="text-muted-foreground">{selectedContact.email}</p>
                                  </div>
                                  {selectedContact.phone && (
                                    <div>
                                      <p className="font-medium">Phone</p>
                                      <p className="text-muted-foreground">{selectedContact.phone}</p>
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium">Website</p>
                                    <p className="text-muted-foreground">{selectedContact.website}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="font-medium">Message</p>
                                  <p className="text-muted-foreground mt-1">{selectedContact.message}</p>
                                </div>
                                
                                {hasPermission('view_contacts') && (
                                  <div className="space-y-4 border-t pt-4">
                                    <div>
                                      <p className="font-medium mb-2">Send Reply</p>
                                      <Textarea
                                        placeholder="Type your reply..."
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        rows={4}
                                      />
                                    </div>
                                    <div className="flex justify-between">
                                      <div className="flex gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleStatusUpdate(selectedContact._id, 'contacted')}
                                        >
                                          Mark as Contacted
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleStatusUpdate(selectedContact._id, 'resolved')}
                                        >
                                          Mark as Resolved
                                        </Button>
                                      </div>
                                      <Button
                                        onClick={handleReply}
                                        disabled={!replyMessage.trim() || replyLoading}
                                      >
                                        {replyLoading ? 'Sending...' : 'Send Reply'}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {hasPermission('manage_content') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(contact._id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No contacts found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}