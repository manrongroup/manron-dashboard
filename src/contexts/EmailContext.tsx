"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";

// -------------------- TYPES --------------------
interface SentEmail {
  _id: string;
  id?: string;
  subject: string;
  message: string;
  recipients: string[];
  status: "processing" | "sent" | "failed";
  category?: string;
  sentBy?: string;
  createdAt: string;
  updatedAt: string;
  emailRecordId?: string;
}

interface EmailStats {
  totalSent: number;
  totalFailed: number;
  byCategory: Record<string, number>; // e.g. { student: 5, teacher: 3 }
  byUser: Record<string, number>; // e.g. { userId1: 10, userId2: 2 }
}

interface EmailContextType {
  emails: SentEmail[];
  stats: EmailStats | null;
  loading: boolean;
  error: string | null;

  // send (returns emailRecordId for async tracking)
  sendToAll: (data: { subject?: string; message: string }) => Promise<{ emailRecordId: string; message: string }>;
  sendToCategory: (category: string, data: { subject?: string; message: string }) => Promise<{ emailRecordId: string; message: string }>;
  sendToIndividual: (id: string, data: { subject?: string; message: string }) => Promise<{ emailRecordId: string; message: string }>;

  // get
  fetchAllSent: () => Promise<void>;
  fetchByCategory: (category: string) => Promise<void>;
  fetchById: (id: string) => Promise<SentEmail | null>;
  checkEmailStatus: (emailRecordId: string) => Promise<SentEmail | null>;

  // stats
  fetchStats: () => Promise<void>;
}

// -------------------- CONTEXT --------------------
const EmailContext = createContext<EmailContextType | undefined>(undefined);

export function EmailProvider({ children }: { children: ReactNode }) {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // -------------------- GET --------------------
  const fetchAllSent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/emails/sent");
      const emailData = res.data.data || res.data;
      const mapped = (Array.isArray(emailData) ? emailData : []).map((e: any) => ({
        ...e,
        id: e._id || e.id,
        emailRecordId: e._id || e.id || e.emailRecordId
      }));
      setEmails(mapped);
      setError(null);
    } catch (error: any) {
      // Don't let 401 errors from this endpoint trigger logout
      // Just show error and set empty array
      if (error.response?.status === 401) {
        setEmails([]);
        setError("Access denied. Please check your permissions.");
        toast({ title: "Access Denied", description: "You don't have permission to view emails", variant: "destructive" });
      } else {
        const message = error.response?.data?.message || "Failed to fetch emails";
        setError(message);
        toast({ title: "Error", description: message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // -------------------- STATS --------------------
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/emails/stats");
      setStats(res.data);
      setError(null);
    } catch {
      setError("Failed to fetch stats");
      toast({ title: "Error", description: "Failed to fetch stats", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // -------------------- SEND --------------------
  // Emails are sent asynchronously - API returns immediately with emailRecordId
  const sendToAll = useCallback(async (data: { subject?: string; message: string }) => {
    try {
      setLoading(true);
      const response = await api.post("/emails", data);
      // Backend returns: { message, emailRecordId }
      const result = response.data.data || response.data;
      const emailRecordId = result.emailRecordId || result._id;
      const message = result.message || "Emails are being sent. This may take a few moments.";

      toast({
        title: "Success",
        description: message,
        duration: 5000
      });

      // Refresh emails list after a short delay to see the new record
      setTimeout(() => {
        fetchAllSent();
        fetchStats();
      }, 2000);

      return { emailRecordId, message };
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to send emails";
      toast({ title: "Error", description: message, variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchAllSent, fetchStats]);

  const sendToCategory = useCallback(async (category: string, data: { subject?: string; message: string }) => {
    try {
      setLoading(true);
      const response = await api.post(`/emails/categories/${category}`, data);
      const result = response.data.data || response.data;
      const emailRecordId = result.emailRecordId || result._id;
      const message = result.message || `Emails are being sent to ${category}. This may take a few moments.`;

      toast({
        title: "Success",
        description: message,
        duration: 5000
      });

      setTimeout(() => {
        fetchAllSent();
        fetchStats();
      }, 2000);

      return { emailRecordId, message };
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to send emails";
      toast({ title: "Error", description: message, variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchAllSent, fetchStats]);

  const sendToIndividual = useCallback(async (id: string, data: { subject?: string; message: string }) => {
    try {
      setLoading(true);
      const response = await api.post(`/emails/${id}`, data);
      const result = response.data.data || response.data;
      const emailRecordId = result.emailRecordId || result._id;
      const message = result.message || "Email is being sent. This may take a few moments.";

      toast({
        title: "Success",
        description: message,
        duration: 5000
      });

      setTimeout(() => {
        fetchAllSent();
        fetchStats();
      }, 2000);

      return { emailRecordId, message };
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to send email";
      toast({ title: "Error", description: message, variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchAllSent, fetchStats]);

  const fetchByCategory = useCallback(async (category: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/emails/sent/category/${category}`);
      setEmails(res.data);
      setError(null);
    } catch {
      setError("Failed to fetch category emails");
      toast({ title: "Error", description: "Failed to fetch category emails", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchById = useCallback(async (id: string): Promise<SentEmail | null> => {
    try {
      setLoading(true);
      const res = await api.get(`/emails/sent/${id}`);
      const emailData = res.data.data || res.data;
      return emailData;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch email";
      toast({ title: "Error", description: message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Check email status by emailRecordId
  const checkEmailStatus = useCallback(async (emailRecordId: string): Promise<SentEmail | null> => {
    try {
      const res = await api.get(`/emails/sent/${emailRecordId}`);
      const emailData = res.data.data || res.data;
      return emailData;
    } catch (error: any) {
      console.error("Failed to check email status:", error);
      return null;
    }
  }, []);

  // -------------------- VALUE --------------------
  const value: EmailContextType = {
    emails,
    stats,
    loading,
    error,
    sendToAll,
    sendToCategory,
    sendToIndividual,
    fetchAllSent,
    fetchByCategory,
    fetchById,
    checkEmailStatus,
    fetchStats,
  };

  return <EmailContext.Provider value={value}>{children}</EmailContext.Provider>;
}

// -------------------- HOOK --------------------
export function useEmail() {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error("useEmail must be used within an EmailProvider");
  }
  return context;
}
