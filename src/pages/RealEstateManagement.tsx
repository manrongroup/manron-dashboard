import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, DollarSign, Home, Key, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

import { RealEstateForm } from '@/components/RealEstateForm';
import { useAuth } from '@/contexts/AuthContext';


import { realEstateApi } from '@/lib/api';
import { toast } from 'sonner';
import RealEstateTable from '@/components/tables/RealestateTable';
import { Property } from '@/types/realEstate';
import StatCard from '@/components/ui/stat-card';

export default function RealEstateManagement() {
  const { hasPermission } = useAuth();
  const [realEstate, setRealEstate] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewProperty, setViewProperty] = useState<Property | null>(null);

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

  // ✅ Real Estate Stats
  const total = realEstate.length;
  const available = realEstate.filter((p) => p.status === 'Available').length;
  const sold = realEstate.filter((p) => p.saleMethod === 'Sold').length;
  const rented = realEstate.filter((p) => p.status === 'Rented').length;

  const filteredRealEstate = realEstate.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    const matchesType = typeFilter === 'all' || property.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

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
            if (!open) setEditingProperty(null);
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" onClick={() => {
                setEditingProperty(null);
                setIsCreateDialogOpen(true);
              }}>
                <Plus className="w-4 h-4" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProperty ? "Edit Property" : "Create New Property"}</DialogTitle>
              </DialogHeader>
              <RealEstateForm
                property={editingProperty as any}
                onSubmit={async () => {
                  setIsCreateDialogOpen(false);
                  setEditingProperty(null);
                  await fetchRealEstate();
                }}
                onCancel={() => {
                  setIsCreateDialogOpen(false);
                  setEditingProperty(null);
                }}
              />
            </DialogContent>
          </Dialog>

        )}

      </div>

      {/* ✅ Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Properties" value={total} icon={Home} />
        <StatCard title="Available" value={available} icon={CheckCircle} />
        <StatCard title="Sold" value={sold} icon={DollarSign} />
        <StatCard title="Rented" value={rented} icon={Key} />
      </div>

      <div className=' max-w-[1400px] h-full w-full'>
        <RealEstateTable
          properties={filteredRealEstate}
          onDelete={handleDelete}
          onEdit={(property) => {
            setEditingProperty(property as any);
            setIsCreateDialogOpen(true);
          }}
          onCreate={() => {
            setEditingProperty(null);
            setIsCreateDialogOpen(true);
          }}
          onView={(property) => {
            const fullProperty = realEstate.find(p => p._id === property._id) || property;
            // Ensure images are properly formatted
            const propertyWithImages = {
              ...fullProperty,
              images: fullProperty.images || []
            };
            setViewProperty(propertyWithImages);
          }}
        />
      </div>

      {/* View Property Details Dialog */}
      <Dialog open={!!viewProperty} onOpenChange={() => setViewProperty(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
          </DialogHeader>
          {viewProperty && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <p className="text-base font-semibold">{viewProperty.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-base">
                    <Badge variant="outline">{viewProperty.type}</Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-base">
                    <Badge variant={viewProperty.status === 'Available' ? 'default' : 'secondary'}>
                      {viewProperty.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sale Method</label>
                  <p className="text-base">
                    <Badge variant="outline">{viewProperty.saleMethod}</Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Price</label>
                  <p className="text-base font-semibold">
                    {viewProperty.currency} {viewProperty.price?.toLocaleString()}
                    {viewProperty.paymentType === 'per_month' && ' / month'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <p className="text-base">{viewProperty.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">City</label>
                  <p className="text-base">{viewProperty.city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Country</label>
                  <p className="text-base">{viewProperty.country}</p>
                </div>
                {viewProperty.bedrooms && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bedrooms</label>
                    <p className="text-base">{viewProperty.bedrooms}</p>
                  </div>
                )}
                {viewProperty.bathrooms && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bathrooms</label>
                    <p className="text-base">{viewProperty.bathrooms}</p>
                  </div>
                )}
                {viewProperty.carSpaces && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Car Spaces</label>
                    <p className="text-base">{viewProperty.carSpaces}</p>
                  </div>
                )}
                {viewProperty.propertySize && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Property Size</label>
                    <p className="text-base">{viewProperty.propertySize} m²</p>
                  </div>
                )}
                {viewProperty.agent && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Agent</label>
                    <div className="mt-1 p-3 bg-muted rounded-lg">
                      <p className="font-semibold">{viewProperty.agent.name}</p>
                      <p className="text-sm">
                        <a href={`mailto:${viewProperty.agent.email}`} className="text-blue-600 hover:underline">
                          {viewProperty.agent.email}
                        </a>
                      </p>
                      <p className="text-sm">
                        <a href={`tel:${viewProperty.agent.phone}`} className="text-blue-600 hover:underline">
                          {viewProperty.agent.phone}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="text-base">
                    {new Date(viewProperty.createdAt).toLocaleString()}
                  </p>
                </div>
                {viewProperty.updatedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                    <p className="text-base">
                      {new Date(viewProperty.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="text-base whitespace-pre-wrap">{viewProperty.description}</p>
                </div>
              </div>
              {viewProperty.features && viewProperty.features.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Features</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {viewProperty.features.map((feature, idx) => (
                      <Badge key={idx} variant="secondary">{feature}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {viewProperty.images && viewProperty.images.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Images</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {viewProperty.images.map((img: any, idx: number) => {
                      // Handle both string URLs and object format { url: string, isMain: boolean }
                      let imageUrl: string | null = null;

                      if (typeof img === 'string') {
                        imageUrl = img;
                      } else if (img && typeof img === 'object') {
                        imageUrl = img.url || img.image || img.src || null;
                      }

                      if (!imageUrl) return null;

                      // If URL is already absolute (starts with http/https), use it as is
                      // Otherwise, construct full URL from base API URL
                      const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://api.manrongroup.com/api/v1';
                      const baseDomain = apiBaseUrl.replace('/api/v1', '');
                      const fullImageUrl = imageUrl.startsWith('http://') || imageUrl.startsWith('https://')
                        ? imageUrl
                        : imageUrl.startsWith('/')
                          ? `${baseDomain}${imageUrl}`
                          : imageUrl;

                      return (
                        <img
                          key={idx}
                          src={fullImageUrl}
                          alt={`${viewProperty.title} ${idx + 1}`}
                          className="rounded-lg w-full h-32 object-cover cursor-pointer hover:opacity-80 transition-opacity border border-border"
                          onError={(e) => {
                            // Hide image if it fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}