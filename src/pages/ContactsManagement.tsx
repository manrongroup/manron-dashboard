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
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import StatCard from '@/components/ui/stat-card';
import ContactsTable from '@/components/tables/ContactTable';

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
      const response = await api.get('/message');
      setContacts(response.data || []);
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
      await api.patch(`/message/${id}`, { status });
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
      await api.delete(`/message/${id}`);
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
      await api.post(`/message/emails/${selectedContact._id}`, {
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
  const stats = (() => {
    const total = contacts.length;
    const newContacts = contacts.filter(c => c.status === 'new').length;
    const contacted = contacts.filter(c => c.status === 'contacted').length;
    const resolved = contacts.filter(c => c.status === 'resolved').length;

    // --- Trend calculation using createdAt ---
    const now = new Date();
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(now.getDate() - 1);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const contactsLastDay = contacts.filter(c => new Date(c.createdAt) >= oneDayAgo).length;
    const contactsPrevDay = contacts.filter(
      c => new Date(c.createdAt) < oneDayAgo && new Date(c.createdAt) >= sevenDaysAgo
    ).length;

    const trendValue = contactsPrevDay
      ? Math.round(((contactsLastDay - contactsPrevDay) / contactsPrevDay) * 100)
      : contactsLastDay > 0
      ? 100
      : 0;

    return {
      total,
      new: newContacts,
      contacted,
      resolved,
      trend: {
        value: trendValue,
        isPositive: trendValue >= 0,
      },
    };
  })();

  console.log("Filtered Contacts:", filteredContacts);
  console.log("All Contacts:", contacts);


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
    trend={stats.trend}
  />
  <StatCard
    title="New Contacts"
    value={stats.new}
    icon={Mail}
    trend={stats.trend}
  />
  <StatCard
    title="Contacted"
    value={stats.contacted}
    icon={Phone}
    trend={stats.trend}
  />
  <StatCard
    title="Resolved"
    value={stats.resolved}
    icon={CheckCircle}
    trend={stats.trend}
  />
</div>


      <ContactsTable
        contacts={filteredContacts}
        onEdit={(contact) => setSelectedContact(contact)}
        onDelete={handleDelete}
        onStatusChange={handleStatusUpdate}
      />

    </div>
  );
}