import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  X, Upload, MapPin, DollarSign, Home, Phone, Mail, User,
  Video, Play, Trash2, Edit, Plus, Save, Eye, Settings
} from 'lucide-react';
import { Property } from '@/types/realEstate';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

// Base schema with common fields
const baseSchema = z.object({
  code: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum([
    "House",
    "Townhouse",
    "Apartment & Unit",
    "Villa",
    "Land",
    "Rural",
    "Acreage",
    "Block Of Units",
    "Retirement Living"
  ]),
  saleMethod: z.enum(['Private treaty sale', 'Auction', 'Rent', 'Sold']).optional(),
  status: z.enum(['Available', 'Under contract', 'Rented', 'Sold']).optional(),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.string().default('RWF'),
  paymentType: z.enum(['per_month', 'one_time']).default('per_month'),
  location: z.string().min(1, 'Location is required'),
  city: z.string().optional().default('Kigali'),
  country: z.string().optional().default('Rwanda'),
  latitude: z.string().optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)).refine(val => val === undefined || (!isNaN(val)), { message: "Must be a valid number" }),
  longitude: z.string().optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)).refine(val => val === undefined || (!isNaN(val)), { message: "Must be a valid number" }),
  agentName: z.string().optional(),
  agentPhone: z.string().optional(),
  agentEmail: z.string().optional().refine((val) => !val || z.string().email().safeParse(val).success, {
    message: "Please enter a valid email address"
  }),
  furnished: z.boolean().optional(),
  isDeal: z.boolean().optional(),
  dealExpires: z.date().optional(),
  petsConsidered: z.boolean().optional(),
  availableDate: z.date().optional(),
  soldDate: z.date().optional(),
});

// Land-specific schema
const landSchema = baseSchema.extend({
  type: z.literal('Land'),
  landSize: z.string().min(1, 'Land size is required').transform(val => Number(val)).refine(val => !isNaN(val) && val > 0, { message: "Must be a positive number" }),
  propertySize: z.string().optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)).refine(val => val === undefined || (!isNaN(val) && val >= 0), { message: "Must be a positive number" }),
});

// Rural-specific schema
const ruralSchema = baseSchema.extend({
  type: z.literal('Rural'),
  landSize: z.string().min(1, 'Land size is required').transform(val => Number(val)).refine(val => !isNaN(val) && val > 0, { message: "Must be a positive number" }),
  propertySize: z.string().optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)).refine(val => val === undefined || (!isNaN(val) && val >= 0), { message: "Must be a positive number" }),
});

// Acreage-specific schema
const acreageSchema = baseSchema.extend({
  type: z.literal('Acreage'),
  landSize: z.string().min(1, 'Land size is required').transform(val => Number(val)).refine(val => !isNaN(val) && val > 0, { message: "Must be a positive number" }),
  propertySize: z.string().optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)).refine(val => val === undefined || (!isNaN(val) && val >= 0), { message: "Must be a positive number" }),
});

// Residential property schemas (House, Townhouse, Apartment & Unit, Villa, Retirement Living)
const residentialSchema = baseSchema.extend({
  type: z.enum(['House', 'Townhouse', 'Apartment & Unit', 'Villa', 'Retirement Living']),
  bedrooms: z.string().min(1, 'Bedrooms is required').transform(val => Number(val)).refine(val => !isNaN(val) && val > 0, { message: "Must be a positive number" }),
  bathrooms: z.string().min(1, 'Bathrooms is required').transform(val => Number(val)).refine(val => !isNaN(val) && val > 0, { message: "Must be a positive number" }),
  carSpaces: z.string().optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)).refine(val => val === undefined || (!isNaN(val) && val >= 0), { message: "Must be a positive number" }),
  propertySize: z.string().optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)).refine(val => val === undefined || (!isNaN(val) && val >= 0), { message: "Must be a positive number" }),
  yearBuilt: z.string().optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)).refine(val => val === undefined || (!isNaN(val) && val >= 0), { message: "Must be a positive number" }),
});

// Commercial property schema (Block Of Units)
const commercialSchema = baseSchema.extend({
  type: z.literal('Block Of Units'),
  rooms: z.string().min(1, 'Total rooms is required').transform(val => Number(val)).refine(val => !isNaN(val) && val > 0, { message: "Must be a positive number" }),
  carSpaces: z.string().optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)).refine(val => val === undefined || (!isNaN(val) && val >= 0), { message: "Must be a positive number" }),
  propertySize: z.string().optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)).refine(val => val === undefined || (!isNaN(val) && val >= 0), { message: "Must be a positive number" }),
  yearBuilt: z.string().optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)).refine(val => val === undefined || (!isNaN(val) && val >= 0), { message: "Must be a positive number" }),
});

// Main schema with custom validation
const realEstateSchema = baseSchema.extend({
  bedrooms: z.string().optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)).refine(val => val === undefined || (!isNaN(val) && val >= 0), { message: "Must be a positive number" }),
  bathrooms: z.string().optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)).refine(val => val === undefined || (!isNaN(val) && val >= 0), { message: "Must be a positive number" }),
  carSpaces: z.string().optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)).refine(val => val === undefined || (!isNaN(val) && val >= 0), { message: "Must be a positive number" }),
  rooms: z.string().optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)).refine(val => val === undefined || (!isNaN(val) && val >= 0), { message: "Must be a positive number" }),
  landSize: z.string().optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)).refine(val => val === undefined || (!isNaN(val) && val >= 0), { message: "Must be a positive number" }),
  propertySize: z.string().optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)).refine(val => val === undefined || (!isNaN(val) && val >= 0), { message: "Must be a positive number" }),
  yearBuilt: z.string().optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)).refine(val => val === undefined || (!isNaN(val) && val >= 0), { message: "Must be a positive number" }),
}).refine((data) => {
  // Custom validation based on property type
  if (data.type === 'Land' || data.type === 'Rural' || data.type === 'Acreage') {
    return data.landSize !== undefined && data.landSize > 0;
  }
  if (data.type === 'House' || data.type === 'Townhouse' || data.type === 'Apartment & Unit' || data.type === 'Villa' || data.type === 'Retirement Living') {
    return data.bedrooms !== undefined && data.bedrooms > 0 && data.bathrooms !== undefined && data.bathrooms > 0;
  }
  if (data.type === 'Block Of Units') {
    return data.rooms !== undefined && data.rooms > 0;
  }
  return true;
}, {
  message: "Please fill in the required fields for the selected property type",
  path: ["type"]
});



// Video Schema
const videoSchema = z.object({
  youtubeUrl: z.string().min(1, 'YouTube URL is required'),
  title: z.string().min(1, 'Video title is required'),
  isMain: z.boolean().optional().default(false),
});

type RealEstateFormData = z.infer<typeof realEstateSchema>;
type VideoFormData = z.infer<typeof videoSchema>;

interface PropertyVideo {
  _id: string;
  property: string;
  url: string;
  youtubeId: string;
  title: string;
  isMain: boolean;
  createdAt: string;
}

interface RealEstateFormProps {
  property?: Property;
  onSubmit: (data: RealEstateFormData) => Promise<void>;
  onCancel: () => void;
}

// YouTube thumbnail helper
const getYouTubeThumbnail = (youtubeId: string) => {
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
};

// Extract YouTube ID helper
const extractYoutubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Function to get the appropriate schema based on property type
const getSchemaForType = (type: string) => {
  switch (type) {
    case 'Land':
      return landSchema;
    case 'Rural':
      return ruralSchema;
    case 'Acreage':
      return acreageSchema;
    case 'House':
    case 'Townhouse':
    case 'Apartment & Unit':
    case 'Villa':
    case 'Retirement Living':
      return residentialSchema;
    case 'Block Of Units':
      return commercialSchema;
    default:
      return baseSchema;
  }
};

export function RealEstateForm({ property, onSubmit, onCancel }: RealEstateFormProps) {
  // Property form states
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [features, setFeatures] = useState<string[]>(property?.features || []);
  const [newFeature, setNewFeature] = useState('');
  const [propertyId, setPropertyId] = useState<string | null>(property?._id || null);

  // Video management states
  const [videos, setVideos] = useState<PropertyVideo[]>([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<PropertyVideo | null>(null);
  const [activeTab, setActiveTab] = useState('property');

  // Property form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(realEstateSchema),
    defaultValues: property ? {
      code: property.code,
      title: property.title,
      description: property.description,
      type: property.type,
      saleMethod: property.saleMethod,
      status: property.status,
      price: property.price,
      currency: property.currency,
      paymentType: property.paymentType,
      bedrooms: property.bedrooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      carSpaces: property.carSpaces?.toString() || '',
      rooms: property.rooms?.toString() || '',
      landSize: property.landSize?.toString() || '',
      propertySize: property.propertySize?.toString() || '',
      yearBuilt: property.yearBuilt?.toString() || '',
      furnished: property.furnished,
      isDeal: property.isDeal,
      dealExpires: property.dealExpires ? new Date(property.dealExpires) : undefined,
      petsConsidered: property.petsConsidered,
      availableDate: property.availableDate ? new Date(property.availableDate) : undefined,
      soldDate: property.soldDate ? new Date(property.soldDate) : undefined,
      location: property.location,
      city: property.city,
      country: property.country,
      latitude: property.latitude?.toString() || '',
      longitude: property.longitude?.toString() || '',
      agentName: property.agent?.name,
      agentPhone: property.agent?.phone,
      agentEmail: property.agent?.email,
    } : {
      type: 'House',
      saleMethod: 'Rent',
      status: 'Available',
      currency: 'RWF',
      paymentType: 'per_month',
      city: 'Kigali',
      country: 'Rwanda',
      furnished: false,
      isDeal: false,
      petsConsidered: false,
    },
  });

  // Video form setup
  const {
    register: registerVideo,
    handleSubmit: handleVideoSubmit,
    setValue: setVideoValue,
    reset: resetVideo,
    watch: watchVideo,
    formState: { errors: videoErrors },
  } = useForm({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      youtubeUrl: '',
      title: '',
      isMain: false,
    },
  });

  const watchedType = watch('type');
  const watchedSaleMethod = watch('saleMethod');
  const watchedStatus = watch('status');
  const watchedIsDeal = watch('isDeal');

  // Load videos when property changes
  useEffect(() => {
    if (propertyId) {
      loadPropertyVideos();
    }
  }, [propertyId]);

  // Load existing videos for property
  const loadPropertyVideos = async () => {
    if (!propertyId) return;

    setLoadingVideos(true);
    try {
      const response = await api.get(`/realestate/properties/videos/property/${propertyId}`);
      setVideos(response.data);
    } catch (error: unknown) {
      console.error('Failed to load videos:', error);
      toast({
        title: "Error",
        description: "Failed to load property videos",
        variant: "destructive",
      });
    } finally {
      setLoadingVideos(false);
    }
  };

  // Property form handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFeatures(features.filter(f => f !== feature));
  };


  const onFormSubmit = async (data: RealEstateFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Append normal fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            formData.append(key, value.toISOString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Agent fields
      formData.append("agent[name]", data.agentName);
      formData.append("agent[phone]", data.agentPhone);
      formData.append("agent[email]", data.agentEmail);

      // Features
      features.forEach(feature => formData.append("features", feature));

      // Images
      images.forEach((image) => {
        formData.append("images", image);
      });

      let newPropertyId: string;
      if (property) {
        const response = await api.put(
          `/realestate/properties/${property._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        newPropertyId = property._id;
        // setPropertyId(newPropertyId);
        toast({ title: "Success", description: "Property updated successfully" });
      } else {
        const response = await api.post("/realestate/properties", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        newPropertyId = response.data._id;
        setPropertyId(newPropertyId);
        toast({ title: "Success", description: "Property created successfully" });
        // Switch to video tab after creating property
        setActiveTab('videos');
      }

      onSubmit(data);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: axiosError.response?.data?.message || "Failed to save property",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Video form handlers
  const onVideoSubmit = async (data: VideoFormData) => {
    if (!propertyId) {
      toast({
        title: "Error",
        description: "Please create the property first before adding videos",
        variant: "destructive",
      });
      return;
    }

    setVideoLoading(true);
    try {
      const youtubeId = extractYoutubeId(data.youtubeUrl);
      if (!youtubeId) {
        toast({
          title: "Error",
          description: "Invalid YouTube URL",
          variant: "destructive",
        });
        return;
      }

      if (editingVideo) {
        // Update existing video
        await api.put(`/realestate/properties/videos/${editingVideo._id}`, {
          youtubeUrl: data.youtubeUrl,
          title: data.title,
          isMain: data.isMain,
        });
        toast({ title: "Success", description: "Video updated successfully" });
      } else {
        // Add new video
        await api.post("/realestate/properties/videos", {
          propertyId: propertyId,
          youtubeUrl: data.youtubeUrl,
          title: data.title,
          isMain: data.isMain,
        });
        toast({ title: "Success", description: "Video added successfully" });
      }

      // Refresh videos list
      await loadPropertyVideos();
      resetVideo();
      setShowVideoForm(false);
      setEditingVideo(null);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: axiosError.response?.data?.message || "Failed to save video",
        variant: "destructive",
      });
    } finally {
      setVideoLoading(false);
    }
  };

  const handleEditVideo = (video: PropertyVideo) => {
    setEditingVideo(video);
    setVideoValue('youtubeUrl', video.url);
    setVideoValue('title', video.title);
    setVideoValue('isMain', video.isMain);
    setShowVideoForm(true);
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await api.delete(`/realestate/properties/videos/${videoId}`);
      toast({ title: "Success", description: "Video deleted successfully" });
      await loadPropertyVideos();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: axiosError.response?.data?.message || "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  const handleCancelVideoForm = () => {
    resetVideo();
    setShowVideoForm(false);
    setEditingVideo(null);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="property" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Property Details
          </TabsTrigger>
          <TabsTrigger
            value="videos"
            className="flex items-center gap-2"
            disabled={!propertyId}
          >
            <Video className="w-4 h-4" />
            Videos ({videos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="property" className="space-y-6">
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Property Type Selection - First Priority */}
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Home className="w-5 h-5" />
                  Select Property Type
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose the type of property you want to list. This will determine which fields are required.
                </p>
              </CardHeader>
              <CardContent>
                <div className="max-w-md">
                  <Label htmlFor="type" className="text-base font-semibold">Property Type *</Label>
                  <Select
                    value={watchedType}
                    onValueChange={(value: string) => setValue('type', value as typeof watchedType)}
                  >
                    <SelectTrigger className="h-12 text-lg">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="House">🏠 House</SelectItem>
                      <SelectItem value="Townhouse">🏘️ Townhouse</SelectItem>
                      <SelectItem value="Apartment & Unit">🏢 Apartment & Unit</SelectItem>
                      <SelectItem value="Villa">🏡 Villa</SelectItem>
                      <SelectItem value="Land">🏞️ Land</SelectItem>
                      <SelectItem value="Rural">🌾 Rural</SelectItem>
                      <SelectItem value="Acreage">🌍 Acreage</SelectItem>
                      <SelectItem value="Block Of Units">🏬 Block Of Units</SelectItem>
                      <SelectItem value="Retirement Living">👴 Retirement Living</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-destructive mt-2 font-medium">{errors.type.message}</p>
                  )}

                  {/* Show what fields will be required based on selection */}
                  {watchedType && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Required fields for {watchedType}:</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {(watchedType === 'House' || watchedType === 'Townhouse' || watchedType === 'Apartment & Unit' || watchedType === 'Villa' || watchedType === 'Retirement Living') ? (
                          <>
                            <div>• Bedrooms and Bathrooms</div>
                            <div>• Car Spaces (optional)</div>
                          </>
                        ) : (watchedType === 'Block Of Units') ? (
                          <>
                            <div>• Total Rooms</div>
                            <div>• Car Spaces (optional)</div>
                          </>
                        ) : (watchedType === 'Land' || watchedType === 'Rural' || watchedType === 'Acreage') ? (
                          <>
                            <div>• Land Size (sqm)</div>
                            <div>• No car spaces or year built needed</div>
                          </>
                        ) : null}
                        <div className="text-xs text-muted-foreground/70 mt-2">
                          Note: Agent info, GPS coordinates, city, and country are optional for all property types
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Property Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="code">Property Code (Optional)</Label>
                    <Input
                      id="code"
                      {...register('code')}
                      placeholder="e.g., CR 068"
                    />
                  </div>

                  <div>
                    <Label htmlFor="title">Property Title</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="Enter property title"
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Enter property description"
                      rows={4}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <Label htmlFor="saleMethod">Sale Method</Label>
                      <Select
                        value={watchedSaleMethod}
                        onValueChange={(value: string) => setValue('saleMethod', value as typeof watchedSaleMethod)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Private treaty sale">Private treaty sale</SelectItem>
                          <SelectItem value="Auction">Auction</SelectItem>
                          <SelectItem value="Rent">Rent</SelectItem>
                          <SelectItem value="Sold">Sold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={watchedStatus}
                      onValueChange={(value: string) => setValue('status', value as typeof watchedStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Under contract">Under contract</SelectItem>
                        <SelectItem value="Rented">Rented</SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing & Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Pricing & Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        {...register('price', { valueAsNumber: true })}
                        placeholder="Enter price"
                      />
                      {errors.price && (
                        <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        defaultValue="RWF"
                        onValueChange={(value) => setValue('currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RWF">RWF</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="paymentType">Payment Type</Label>
                    <Select
                      defaultValue="per_month"
                      onValueChange={(value: string) => setValue('paymentType', value as 'per_month' | 'one_time')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_month">Per Month</SelectItem>
                        <SelectItem value="one_time">One Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Conditional fields based on property type */}
                  {(watchedType === 'House' || watchedType === 'Townhouse' || watchedType === 'Apartment & Unit' || watchedType === 'Villa' || watchedType === 'Retirement Living') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bedrooms">Bedrooms *</Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          {...register('bedrooms')}
                          placeholder="Number of bedrooms"
                        />
                        {errors.bedrooms && (
                          <p className="text-sm text-destructive mt-1">{errors.bedrooms.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="bathrooms">Bathrooms *</Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          {...register('bathrooms')}
                          placeholder="Number of bathrooms"
                        />
                        {errors.bathrooms && (
                          <p className="text-sm text-destructive mt-1">{errors.bathrooms.message}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {watchedType === 'Block Of Units' && (
                    <div>
                      <Label htmlFor="rooms">Total Rooms *</Label>
                      <Input
                        id="rooms"
                        type="number"
                        {...register('rooms')}
                        placeholder="Total number of rooms"
                      />
                      {errors.rooms && (
                        <p className="text-sm text-destructive mt-1">{errors.rooms.message}</p>
                      )}
                    </div>
                  )}

                  {(watchedType === 'Land' || watchedType === 'Rural' || watchedType === 'Acreage') && (
                    <div>
                      <Label htmlFor="landSize">Land Size (sqm) *</Label>
                      <Input
                        id="landSize"
                        type="number"
                        {...register('landSize')}
                        placeholder="Land size in sqm"
                      />
                      {errors.landSize && (
                        <p className="text-sm text-destructive mt-1">{errors.landSize.message}</p>
                      )}
                    </div>
                  )}

                  {/* Optional fields that show for all property types except Land types */}
                  {watchedType !== 'Land' && watchedType !== 'Rural' && watchedType !== 'Acreage' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="carSpaces">Car Spaces</Label>
                        <Input
                          id="carSpaces"
                          type="number"
                          {...register('carSpaces')}
                          placeholder="Number of car spaces"
                        />
                      </div>
                      <div>
                        <Label htmlFor="propertySize">Property Size (sqm)</Label>
                        <Input
                          id="propertySize"
                          type="number"
                          {...register('propertySize')}
                          placeholder="Property size in sqm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Property size for Land types (different from car spaces) */}
                  {(watchedType === 'Land' || watchedType === 'Rural' || watchedType === 'Acreage') && (
                    <div>
                      <Label htmlFor="propertySize">Property Size (sqm)</Label>
                      <Input
                        id="propertySize"
                        type="number"
                        {...register('propertySize')}
                        placeholder="Property size in sqm"
                      />
                    </div>
                  )}

                  {/* Year Built - not applicable for Land types */}
                  {watchedType !== 'Land' && watchedType !== 'Rural' && watchedType !== 'Acreage' && (
                    <div>
                      <Label htmlFor="yearBuilt">Year Built</Label>
                      <Input
                        id="yearBuilt"
                        type="number"
                        {...register('yearBuilt')}
                        placeholder="Year property was built"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="furnished"
                      checked={watch("furnished")}
                      onCheckedChange={(checked) => setValue("furnished", checked === true)}
                    />
                    <Label htmlFor="furnished">Furnished</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="petsConsidered"
                      checked={watch("petsConsidered")}
                      onCheckedChange={(checked) => setValue("petsConsidered", checked === true)}
                    />
                    <Label htmlFor="petsConsidered">Pets Considered</Label>

                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isDeal"
                      checked={watchedIsDeal}
                      onCheckedChange={(checked) => setValue("isDeal", checked === true)} // update form value
                    />
                    <Label htmlFor="isDeal">Special Deal</Label>
                  </div>



                  {watchedIsDeal && (
                    <div>
                      <Label htmlFor="dealExpires">Deal Expires</Label>
                      <Input
                        id="dealExpires"
                        type="date"
                        {...register('dealExpires', { valueAsDate: true })}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location & Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location & Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="location">Location/Area</Label>
                    <Input
                      id="location"
                      {...register('location')}
                      placeholder="e.g., Nyarutarama"
                    />
                    {errors.location && (
                      <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City (Optional)</Label>
                      <Input
                        id="city"
                        {...register('city')}
                        placeholder="City (optional)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country (Optional)</Label>
                      <Input
                        id="country"
                        {...register('country')}
                        placeholder="Country (optional)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">Latitude (Optional)</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        {...register('latitude')}
                        placeholder="GPS Latitude (optional)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude (Optional)</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        {...register('longitude')}
                        placeholder="GPS Longitude (optional)"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="agentName" className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Agent Name (Optional)
                    </Label>
                    <Input
                      id="agentName"
                      {...register('agentName')}
                      placeholder="Agent name (optional)"
                    />
                    {errors.agentName && (
                      <p className="text-sm text-destructive mt-1">{errors.agentName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="agentPhone" className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Agent Phone (Optional)
                    </Label>
                    <Input
                      id="agentPhone"
                      {...register('agentPhone')}
                      placeholder="Agent phone number (optional)"
                    />
                    {errors.agentPhone && (
                      <p className="text-sm text-destructive mt-1">{errors.agentPhone.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="agentEmail" className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Agent Email (Optional)
                    </Label>
                    <Input
                      id="agentEmail"
                      type="email"
                      {...register('agentEmail')}
                      placeholder="Agent email address (optional)"
                    />
                    {errors.agentEmail && (
                      <p className="text-sm text-destructive mt-1">{errors.agentEmail.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="availableDate">Available Date</Label>
                      <Input
                        id="availableDate"
                        type="date"
                        {...register('availableDate', { valueAsDate: true })}
                      />
                    </div>
                    {watchedStatus === 'Sold' && (
                      <div>
                        <Label htmlFor="soldDate">Sold Date</Label>
                        <Input
                          id="soldDate"
                          type="date"
                          {...register('soldDate', { valueAsDate: true })}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features & Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Add Features</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Add a feature"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                      <Button type="button" onClick={addFeature} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                          {feature}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeFeature(feature)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Property Images
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="images">Upload Images</Label>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                    {images.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {images.length} image(s) selected
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : property ? 'Update Property' : 'Create Property'}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          {!propertyId ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Video className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium">Create Property First</h3>
                    <p className="text-muted-foreground">
                      You need to create the property before you can add videos.
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab('property')}>
                    Go to Property Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Video Management Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Property Videos ({videos.length})
                    </CardTitle>
                    <Button
                      onClick={() => setShowVideoForm(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Video
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Video Form */}
              {showVideoForm && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {editingVideo ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      {editingVideo ? 'Edit Video' : 'Add New Video'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleVideoSubmit(onVideoSubmit)} className="space-y-4">
                      <div>
                        <Label htmlFor="videoUrl">YouTube URL</Label>
                        <Input
                          id="videoUrl"
                          {...registerVideo('youtubeUrl')}
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                        {videoErrors.youtubeUrl && (
                          <p className="text-sm text-destructive mt-1">{videoErrors.youtubeUrl.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="videoTitle">Video Title</Label>
                        <Input
                          id="videoTitle"
                          {...registerVideo('title')}
                          placeholder="Enter video title"
                        />
                        {videoErrors.title && (
                          <p className="text-sm text-destructive mt-1">{videoErrors.title.message}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isMain"
                          {...registerVideo('isMain')}
                        />
                        <Label htmlFor="isMain">Set as main video</Label>
                      </div>

                      <div className="flex justify-end gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelVideoForm}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={videoLoading}>
                          {videoLoading ? 'Saving...' : editingVideo ? 'Update Video' : 'Add Video'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Videos List */}
              {loadingVideos ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span>Loading videos...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : videos.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <Video className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-medium">No Videos Added</h3>
                        <p className="text-muted-foreground">
                          Add YouTube videos to showcase this property.
                        </p>
                      </div>
                      <Button onClick={() => setShowVideoForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Video
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {videos.map((video) => (
                    <Card key={video._id} className="overflow-hidden">
                      <div className="grid md:grid-cols-3 gap-4">
                        {/* Video Thumbnail */}
                        <div className="relative">
                          <img
                            src={getYouTubeThumbnail(video.youtubeId)}
                            alt={video.title}
                            className="w-full h-48 md:h-full object-cover rounded-l-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/api/placeholder/400/225';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-red-600 text-white rounded-full p-3">
                              <Play className="w-8 h-8 fill-current" />
                            </div>
                          </div>
                          {video.isMain && (
                            <Badge className="absolute top-2 left-2 bg-blue-600">
                              Main Video
                            </Badge>
                          )}
                        </div>

                        {/* Video Details */}
                        <div className="md:col-span-2 p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                              <p className="text-sm text-muted-foreground mb-4 break-all">
                                {video.url}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Video ID: {video.youtubeId}</span>
                                <span>Added: {new Date(video.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* Video Actions */}
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(video.url, '_blank')}
                                className="flex items-center gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                Watch
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditVideo(video)}
                                className="flex items-center gap-1"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this video?')) {
                                    handleDeleteVideo(video._id);
                                  }
                                }}
                                className="flex items-center gap-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}