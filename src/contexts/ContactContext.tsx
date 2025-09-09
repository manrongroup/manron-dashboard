import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { ApiResponse, PaginatedResponse } from '@/types/api';

interface Contact {
    _id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    status: 'New' | 'InProgress' | 'Resolved';
    assignedTo?: string;
    priority: 'Low' | 'Medium' | 'High';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

interface ContactFilters {
    status?: string;
    priority?: string;
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

interface ContactContextState {
    contacts: Contact[];
    loading: boolean;
    error: string | null;
    totalContacts: number;
    filters: ContactFilters;
}

interface ContactContextType extends ContactContextState {
    fetchContacts: (filters?: ContactFilters) => Promise<void>;
    getContactById: (id: string) => Promise<Contact>;
    updateContactStatus: (id: string, status: Contact['status'], notes?: string) => Promise<void>;
    assignContact: (id: string, assignedTo: string) => Promise<void>;
    deleteContact: (id: string) => Promise<void>;
    setFilters: (filters: ContactFilters) => void;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export function ContactProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ContactContextState>({
        contacts: [],
        loading: false,
        error: null,
        totalContacts: 0,
        filters: {},
    });

    const { toast } = useToast();

    const setLoading = (loading: boolean) => {
        setState(prev => ({ ...prev, loading }));
    };

    const setError = (error: string | null) => {
        setState(prev => ({ ...prev, error }));
    };

    const fetchContacts = useCallback(async (filters?: ContactFilters) => {
        try {
            setLoading(true);
            const response = await api.get<PaginatedResponse<Contact>>('/contacts', {
                params: filters,
            });
            setState(prev => ({
                ...prev,
                contacts: response.data.data,
                totalContacts: response.data.pagination.total,
                filters: filters || {},
            }));
        } catch (err) {
            setError('Failed to fetch contacts');
            toast({
                title: 'Error',
                description: 'Failed to fetch contact inquiries',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const getContactById = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const response = await api.get<ApiResponse<Contact>>(`/contacts/${id}`);
            return response.data.data;
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to fetch contact details',
                variant: 'destructive',
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const updateContactStatus = useCallback(async (
        id: string,
        status: Contact['status'],
        notes?: string
    ) => {
        try {
            setLoading(true);
            await api.patch(`/contacts/${id}/status`, { status, notes });
            toast({
                title: 'Success',
                description: 'Contact status updated successfully',
            });
            await fetchContacts(state.filters);
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to update contact status',
                variant: 'destructive',
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchContacts, state.filters, toast]);

    const assignContact = useCallback(async (id: string, assignedTo: string) => {
        try {
            setLoading(true);
            await api.patch(`/contacts/${id}/assign`, { assignedTo });
            toast({
                title: 'Success',
                description: 'Contact assigned successfully',
            });
            await fetchContacts(state.filters);
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to assign contact',
                variant: 'destructive',
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchContacts, state.filters, toast]);

    const deleteContact = useCallback(async (id: string) => {
        try {
            setLoading(true);
            await api.delete(`/contacts/${id}`);
            toast({
                title: 'Success',
                description: 'Contact deleted successfully',
            });
            await fetchContacts(state.filters);
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to delete contact',
                variant: 'destructive',
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchContacts, state.filters, toast]);

    const setFilters = useCallback((filters: ContactFilters) => {
        setState(prev => ({ ...prev, filters }));
        fetchContacts(filters);
    }, [fetchContacts]);

    const value = {
        ...state,
        fetchContacts,
        getContactById,
        updateContactStatus,
        assignContact,
        deleteContact,
        setFilters,
    };

    return (
        <ContactContext.Provider value={value}>
            {children}
        </ContactContext.Provider>
    );
}

export function useContact() {
    const context = useContext(ContactContext);
    if (context === undefined) {
        throw new Error('useContact must be used within a ContactProvider');
    }
    return context;
}
