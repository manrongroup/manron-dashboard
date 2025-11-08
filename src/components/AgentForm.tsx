import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Agent } from '@/types';
import { useUsers } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

const agentSchema = z.object({
    fullname: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    telephone: z.string().optional(),
    title: z.string().optional(),
    experience: z.number().min(0).optional(),
    description: z.string().optional(),
    specializations: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    serviceAreas: z.array(z.string()).optional(),
    status: z.enum(['Active', 'Inactive', 'On Leave']).optional(),
    rating: z.number().min(0).max(5).optional(),
    totalReviews: z.number().min(0).optional(),
    company: z.string().optional(),
});

type AgentFormData = z.infer<typeof agentSchema>;

interface AgentFormProps {
    agent?: Agent;
    onSuccess: () => void;
}

export function AgentForm({ agent, onSuccess }: AgentFormProps) {
    const { toast } = useToast();
    const { createAgent, updateAgent } = useUsers();
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [specializations, setSpecializations] = useState<string[]>(agent?.specializations || []);
    const [languages, setLanguages] = useState<string[]>(agent?.languages || []);
    const [serviceAreas, setServiceAreas] = useState<string[]>(agent?.serviceAreas || []);
    const [newSpecialization, setNewSpecialization] = useState('');
    const [newLanguage, setNewLanguage] = useState('');
    const [newServiceArea, setNewServiceArea] = useState('');

    const form = useForm<AgentFormData>({
        resolver: zodResolver(agentSchema),
        defaultValues: {
            fullname: agent?.fullname || '',
            email: agent?.email || '',
            telephone: agent?.telephone || '',
            title: agent?.title || '',
            experience: agent?.experience || 0,
            description: agent?.description || '',
            status: (agent?.status as 'Active' | 'Inactive' | 'On Leave') || 'Active',
            rating: agent?.rating || 0,
            totalReviews: agent?.totalReviews || 0,
            company: agent?.company || '',
        },
    });

    // Reset form when agent changes
    useEffect(() => {
        if (agent) {
            form.reset({
                fullname: agent.fullname || '',
                email: agent.email || '',
                telephone: agent.telephone || '',
                title: agent.title || '',
                experience: agent.experience || 0,
                description: agent.description || '',
                status: (agent.status as 'Active' | 'Inactive' | 'On Leave') || 'Active',
                rating: agent.rating || 0,
                totalReviews: agent.totalReviews || 0,
                company: agent.company || '',
            });
            setSpecializations(agent.specializations || []);
            setLanguages(agent.languages || []);
            setServiceAreas(agent.serviceAreas || []);
            setPhotoFile(null);
        } else {
            form.reset({
                fullname: '',
                email: '',
                telephone: '',
                title: '',
                experience: 0,
                description: '',
                status: 'Active',
                rating: 0,
                totalReviews: 0,
                company: '',
            });
            setSpecializations([]);
            setLanguages([]);
            setServiceAreas([]);
            setPhotoFile(null);
        }
    }, [agent?.id || agent?._id, form]);

    const addSpecialization = () => {
        if (newSpecialization.trim() && !specializations.includes(newSpecialization.trim())) {
            setSpecializations([...specializations, newSpecialization.trim()]);
            setNewSpecialization('');
        }
    };

    const removeSpecialization = (index: number) => {
        setSpecializations(specializations.filter((_, i) => i !== index));
    };

    const addLanguage = () => {
        if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
            setLanguages([...languages, newLanguage.trim()]);
            setNewLanguage('');
        }
    };

    const removeLanguage = (index: number) => {
        setLanguages(languages.filter((_, i) => i !== index));
    };

    const addServiceArea = () => {
        if (newServiceArea.trim() && !serviceAreas.includes(newServiceArea.trim())) {
            setServiceAreas([...serviceAreas, newServiceArea.trim()]);
            setNewServiceArea('');
        }
    };

    const removeServiceArea = (index: number) => {
        setServiceAreas(serviceAreas.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: AgentFormData) => {
        try {
            const formData = new FormData();

            // Add all form fields
            Object.keys(data).forEach((key) => {
                const value = data[key as keyof AgentFormData];
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach((item) => formData.append(key, item));
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });

            // Add arrays
            specializations.forEach((item) => formData.append('specializations', item));
            languages.forEach((item) => formData.append('languages', item));
            serviceAreas.forEach((item) => formData.append('serviceAreas', item));

            // Add photo if selected
            if (photoFile) {
                formData.append('photo', photoFile);
            }

            if (agent?.id || agent?._id) {
                await updateAgent(agent.id || agent._id, formData);
                toast({
                    title: 'Success',
                    description: 'Agent updated successfully',
                });
            } else {
                await createAgent(formData);
                toast({
                    title: 'Success',
                    description: 'Agent created successfully',
                });
            }
            onSuccess();
        } catch (error: any) {
            const message = error.response?.data?.message || (agent ? 'Failed to update agent' : 'Failed to create agent');
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="fullname"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter full name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="Enter email address" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="telephone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Telephone</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter telephone number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Senior Real Estate Agent" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Experience (years)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Years of experience"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company</FormLabel>
                                <FormControl>
                                    <Input placeholder="Company name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                        <SelectItem value="On Leave">On Leave</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rating</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        placeholder="Rating (0-5)"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="totalReviews"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Reviews</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Total reviews"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Agent description" {...field} rows={4} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Photo Upload */}
                <div>
                    <FormLabel>Photo</FormLabel>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                        className="mt-2"
                    />
                    {agent?.photo && !photoFile && (
                        <p className="text-sm text-muted-foreground mt-2">Current photo: {agent.photo}</p>
                    )}
                </div>

                {/* Specializations */}
                <div>
                    <FormLabel>Specializations</FormLabel>
                    <div className="flex gap-2 mt-2">
                        <Input
                            placeholder="Add specialization"
                            value={newSpecialization}
                            onChange={(e) => setNewSpecialization(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addSpecialization();
                                }
                            }}
                        />
                        <Button type="button" onClick={addSpecialization} variant="outline">
                            Add
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {specializations.map((spec, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
                            >
                                {spec}
                                <button
                                    type="button"
                                    onClick={() => removeSpecialization(index)}
                                    className="text-destructive hover:text-destructive/80"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Languages */}
                <div>
                    <FormLabel>Languages</FormLabel>
                    <div className="flex gap-2 mt-2">
                        <Input
                            placeholder="Add language"
                            value={newLanguage}
                            onChange={(e) => setNewLanguage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addLanguage();
                                }
                            }}
                        />
                        <Button type="button" onClick={addLanguage} variant="outline">
                            Add
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {languages.map((lang, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
                            >
                                {lang}
                                <button
                                    type="button"
                                    onClick={() => removeLanguage(index)}
                                    className="text-destructive hover:text-destructive/80"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Service Areas */}
                <div>
                    <FormLabel>Service Areas</FormLabel>
                    <div className="flex gap-2 mt-2">
                        <Input
                            placeholder="Add service area"
                            value={newServiceArea}
                            onChange={(e) => setNewServiceArea(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addServiceArea();
                                }
                            }}
                        />
                        <Button type="button" onClick={addServiceArea} variant="outline">
                            Add
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {serviceAreas.map((area, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
                            >
                                {area}
                                <button
                                    type="button"
                                    onClick={() => removeServiceArea(index)}
                                    className="text-destructive hover:text-destructive/80"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="submit" className="shadow-elegant hover:shadow-glow transition-all duration-300">
                        {agent ? 'Update Agent' : 'Create Agent'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

