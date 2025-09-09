import React, { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { RealEstateForm } from '@/components/RealEstateForm';
import { useAuth } from '@/contexts/AuthContext';


import { realEstateApi } from '@/lib/api';
import { toast } from 'sonner';
import RealEstateTable from '@/components/tables/RealestateTable';
import { Property } from '@/types/realEstate';

export default function RealEstateManagement() {
  const { hasPermission } = useAuth();
  const [realEstate, setRealEstate] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    fetchRealEstate();
  }, []);

  const fetchRealEstate = async () => {
    try {
      const response = await realEstateApi.get('/properties');
      setRealEstate(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch real estate properties");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      await realEstateApi.delete(`/properties/${id}`);
      setRealEstate(realEstate.filter((property) => property._id !== id));
      toast.success("Property deleted successfully");
    } catch (error) {
      toast.error("Failed to delete property");
    }
  };

  const filteredRealEstate = realEstate.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    const matchesType = typeFilter === 'all' || property.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  console.log("Filtered Real Estate Properties:", filteredRealEstate);
  console.log("All Real Estate Properties:", realEstate);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success text-success-foreground';
      case 'sold': return 'bg-destructive text-destructive-foreground';
      case 'rented': return 'bg-primary text-primary-foreground';
      case 'pending': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real Estate Management</h1>
          <p className="text-muted-foreground">Manage properties across all websites</p>
        </div>
        {hasPermission('manage_content') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) setEditingProperty(null); // 👈 reset when dialog closes
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProperty ? "Edit Property" : "Create New Property"}</DialogTitle>
              </DialogHeader>
              <RealEstateForm
                property={editingProperty}
                onSubmit={() => {
                  setIsCreateDialogOpen(false);
                  setEditingProperty(null); // 👈 reset after submit
                  fetchRealEstate();
                }}
                onCancel={() => {
                  setIsCreateDialogOpen(false);
                  setEditingProperty(null); // 👈 reset on cancel
                }}
              />
            </DialogContent>
          </Dialog>

        )}

      </div>

      <RealEstateTable
        properties={filteredRealEstate}
        onDelete={handleDelete}
        onEdit={(property) => {
          setEditingProperty(property as any);
          setIsCreateDialogOpen(true);
        }}
      />

    </div>
  );
}