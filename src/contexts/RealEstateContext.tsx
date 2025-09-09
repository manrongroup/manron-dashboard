import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Property } from '@/types/realEstate';

interface RealEstateContextType {
  properties: Property[];
  featuredProperties: Property[];
  recentProperties: Property[];
  totalProperties: number;
  loading: boolean;
  error: string | null;
  fetchProperties: () => Promise<void>;
  fetchFeaturedProperties: () => Promise<void>;
  fetchRecentProperties: () => Promise<void>;
  createProperty: (propertyData: FormData) => Promise<void>;
  updateProperty: (id: string, propertyData: FormData) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
}

const RealEstateContext = createContext<RealEstateContextType | undefined>(undefined);

export function RealEstateProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/realestate/properties');
      setProperties(response.data.properties || response.data);
      setTotalProperties(
        response.data.total ||
          (response.data.properties ? response.data.properties.length : response.data.length)
      );
      setError(null);
    } catch {
      setError('Failed to fetch properties');
      toast({
        title: 'Error',
        description: 'Failed to fetch real estate properties',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createProperty = useCallback(
    async (propertyData: FormData) => {
      try {
        setLoading(true);
        await api.post('/realestate/properties', propertyData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast({
          title: 'Success',
          description: 'Property created successfully',
        });
        await fetchProperties();
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to create property',
          variant: 'destructive',
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProperties, toast]
  );

  const updateProperty = useCallback(
    async (id: string, propertyData: FormData) => {
      try {
        setLoading(true);
        await api.patch(`/realestate/properties/${id}`, propertyData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast({
          title: 'Success',
          description: 'Property updated successfully',
        });
        await fetchProperties();
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to update property',
          variant: 'destructive',
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProperties, toast]
  );

  const deleteProperty = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        await api.delete(`/realestate/properties/${id}`);
        toast({
          title: 'Success',
          description: 'Property deleted successfully',
        });
        await fetchProperties();
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to delete property',
          variant: 'destructive',
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProperties, toast]
  );

  const fetchFeaturedProperties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/realestate/properties/featured');
      setFeaturedProperties(response.data);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch featured properties',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchRecentProperties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/realestate/properties/recent');
      setRecentProperties(response.data);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch recent properties',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const value: RealEstateContextType = {
    properties,
    featuredProperties,
    recentProperties,
    totalProperties,
    loading,
    error,
    fetchProperties,
    fetchFeaturedProperties,
    fetchRecentProperties,
    createProperty,
    updateProperty,
    deleteProperty,
  };

  return <RealEstateContext.Provider value={value}>{children}</RealEstateContext.Provider>;
}

export function useRealEstate() {
  const context = useContext(RealEstateContext);
  if (context === undefined) {
    throw new Error('useRealEstate must be used within a RealEstateProvider');
  }
  return context;
}
