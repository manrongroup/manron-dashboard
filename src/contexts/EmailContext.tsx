import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

interface Email {
    _id: string;
    subject: string;
    content: string;
    recipients: string[];
    status: 'draft' | 'sent';
    sentAt?: string;
    createdAt: string;
    updatedAt: string;
}

interface EmailContextType {
    emails: Email[];
    loading: boolean;
    error: string | null;
    fetchEmails: () => Promise<void>;
    createEmail: (emailData: Omit<Email, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    sendEmail: (id: string) => Promise<void>;
    deleteEmail: (id: string) => Promise<void>;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export function EmailProvider({ children }: { children: ReactNode }) {
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchEmails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/emails');
            setEmails(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch emails');
            toast({
                title: 'Error',
                description: 'Failed to fetch emails',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const createEmail = useCallback(async (emailData: Omit<Email, '_id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true);
            await api.post('/emails', emailData);
            toast({
                title: 'Success',
                description: 'Email created successfully',
            });
            await fetchEmails();
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to create email',
                variant: 'destructive',
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchEmails, toast]);

    const sendEmail = useCallback(async (id: string) => {
        try {
            setLoading(true);
            await api.post(`/emails/${id}/send`);
            toast({
                title: 'Success',
                description: 'Email sent successfully',
            });
            await fetchEmails();
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to send email',
                variant: 'destructive',
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchEmails, toast]);

    const deleteEmail = useCallback(async (id: string) => {
        try {
            setLoading(true);
            await api.delete(`/emails/${id}`);
            toast({
                title: 'Success',
                description: 'Email deleted successfully',
            });
            await fetchEmails();
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to delete email',
                variant: 'destructive',
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchEmails, toast]);

    const value = {
        emails,
        loading,
        error,
        fetchEmails,
        createEmail,
        sendEmail,
        deleteEmail,
    };

    return (
        <EmailContext.Provider value={value}>
            {children}
        </EmailContext.Provider>
    );
}

export function useEmail() {
    const context = useContext(EmailContext);
    if (context === undefined) {
        throw new Error('useEmail must be used within an EmailProvider');
    }
    return context;
}
