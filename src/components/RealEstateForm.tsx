import React, { useState } from 'react';
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
import { X, Upload, MapPin, DollarSign, Home, Phone, Mail, User } from 'lucide-react';
import { RealEstate } from '@/types';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const realEstateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  location: z.string().min(1, 'Location is required'),
  type: z.enum(['apartment', 'house', 'commercial', 'land']),
  status: z.enum(['available', 'sold', 'rented', 'pending']),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  area: z.number().min(1, 'Area is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  contactPhone: z.string().min(1, 'Contact phone is required'),
  contactEmail: z.string().email('Valid email is required'),
});

type RealEstateFormData = z.infer<typeof realEstateSchema>;

interface RealEstateFormProps {
  property?: RealEstate;
  onSubmit: () => void;
  onCancel: () => void;
}

export function RealEstateForm({ property, onSubmit, onCancel }: RealEstateFormProps) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [features, setFeatures] = useState<string[]>(property?.features || []);
  const [newFeature, setNewFeature] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RealEstateFormData>({
    resolver: zodResolver(realEstateSchema),
    defaultValues: property ? {
      title: property.title,
      description: property.description,
      price: property.price,
      location: property.location,
      type: property.type,
      status: property.status,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      contactName: property.contact.name,
      contactPhone: property.contact.phone,
      contactEmail: property.contact.email,
    } : {
      type: 'apartment',
      status: 'available',
    },
  });

  const watchedType = watch('type');

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
      
      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key.startsWith('contact')) {
            return; // Handle contact separately
          }
          formData.append(key, value.toString());
        }
      });

      // Handle contact object
      const contact = {
        name: data.contactName,
        phone: data.contactPhone,
        email: data.contactEmail,
      };
      formData.append('contact', JSON.stringify(contact));

      // Append features
      formData.append('features', JSON.stringify(features));

      // Append images
      images.forEach((image) => {
        formData.append('images', image);
      });

      if (property) {
        await api.patch(`/real-estate/${property._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast({
          title: 'Success',
          description: 'Property updated successfully',
        });
      } else {
        await api.post('/real-estate', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast({
          title: 'Success',
          description: 'Property created successfully',
        });
      }

      onSubmit();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save property',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <Label htmlFor="type">Property Type</Label>
                <Select
                  value={watchedType}
                  onValueChange={(value: any) => setValue('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  defaultValue={property?.status || 'available'}
                  onValueChange={(value: any) => setValue('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Location
              </Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Enter property location"
              />
              {errors.location && (
                <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="price" className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Price
              </Label>
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
              <Label htmlFor="area">Area (sqft)</Label>
              <Input
                id="area"
                type="number"
                {...register('area', { valueAsNumber: true })}
                placeholder="Enter area in square feet"
              />
              {errors.area && (
                <p className="text-sm text-destructive mt-1">{errors.area.message}</p>
              )}
            </div>

            {(watchedType === 'apartment' || watchedType === 'house') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    {...register('bedrooms', { valueAsNumber: true })}
                    placeholder="Number of bedrooms"
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    {...register('bathrooms', { valueAsNumber: true })}
                    placeholder="Number of bathrooms"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Contact & Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contactName" className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Contact Name
              </Label>
              <Input
                id="contactName"
                {...register('contactName')}
                placeholder="Contact person name"
              />
              {errors.contactName && (
                <p className="text-sm text-destructive mt-1">{errors.contactName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contactPhone" className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Contact Phone
              </Label>
              <Input
                id="contactPhone"
                {...register('contactPhone')}
                placeholder="Contact phone number"
              />
              {errors.contactPhone && (
                <p className="text-sm text-destructive mt-1">{errors.contactPhone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contactEmail" className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Contact Email
              </Label>
              <Input
                id="contactEmail"
                type="email"
                {...register('contactEmail')}
                placeholder="Contact email address"
              />
              {errors.contactEmail && (
                <p className="text-sm text-destructive mt-1">{errors.contactEmail.message}</p>
              )}
            </div>

            <div>
              <Label>Property Features</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature"
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

            <div>
              <Label htmlFor="images" className="flex items-center gap-1">
                <Upload className="w-4 h-4" />
                Property Images
              </Label>
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
  );
}