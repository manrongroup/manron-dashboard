import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Globe, Edit, Trash2, Eye } from 'lucide-react';
import { Website } from '@/types';
import { WebsiteForm } from '@/components/WebsiteForm';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function WebsiteManagement() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [deleteWebsite, setDeleteWebsite] = useState<Website | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const response = await api.get('/websites');
      setWebsites(response.data.data || []);
    } catch (error) {
      console.error('Error fetching websites:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch websites',
        variant: 'destructive',
      });
      // Mock data for demonstration
      setWebsites([
        {
          _id: '1',
          name: 'Prime Properties',
          domain: 'primeproperties.com',
          type: 'real-estate',
          status: 'active',
          description: 'Luxury real estate listings and management'
        },
        {
          _id: '2',
          name: 'Tech Blog Central',
          domain: 'techcentral.blog',
          type: 'blog',
          status: 'active',
          description: 'Technology news and tutorials'
        },
        {
          _id: '3',
          name: 'Corporate Solutions',
          domain: 'corpsolutions.com',
          type: 'corporate',
          status: 'inactive',
          description: 'Business solutions and services'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (website: Website) => {
    try {
      await api.delete(`/websites/${website._id}`);
      setWebsites(websites.filter(w => w._id !== website._id));
      toast({
        title: 'Success',
        description: 'Website deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete website',
        variant: 'destructive',
      });
    }
    setDeleteWebsite(null);
  };

  const filteredWebsites = websites.filter(website =>
    website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    website.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    website.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'real-estate': return 'default';
      case 'blog': return 'secondary';
      case 'corporate': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Website Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage all your websites and their configurations
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-elegant hover:shadow-glow transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Add Website
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Website</DialogTitle>
            </DialogHeader>
            <WebsiteForm
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                fetchWebsites();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-border/50 shadow-subtle">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search websites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Websites Table */}
      <Card className="border-border/50 shadow-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Websites ({filteredWebsites.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredWebsites.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No websites found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWebsites.map((website) => (
                    <TableRow key={website._id}>
                      <TableCell className="font-medium">{website.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          {website.domain}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeVariant(website.type)}>
                          {website.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(website.status)}>
                          {website.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {website.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://${website.domain}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedWebsite(website);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteWebsite(website)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Website</DialogTitle>
          </DialogHeader>
          {selectedWebsite && (
            <WebsiteForm
              website={selectedWebsite}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedWebsite(null);
                fetchWebsites();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteWebsite} onOpenChange={() => setDeleteWebsite(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Website</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteWebsite?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteWebsite && handleDelete(deleteWebsite)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}