"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";

// -------------------- TYPES --------------------
interface SentEmail {
  _id: string;
  subject: string;
  message: string;
  recipients: string[];
  status: "sent" | "failed";
  category: string;
  sentBy: string;
  createdAt: string;
  updatedAt: string;
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

  // send
  sendToAll: (data: { subject?: string; message: string }) => Promise<void>;
  sendToCategory: (category: string, data: { subject?: string; message: string }) => Promise<void>;
  sendToIndividual: (id: string, data: { subject?: string; message: string }) => Promise<void>;

  // get
  fetchAllSent: () => Promise<void>;
  fetchByCategory: (category: string) => Promise<void>;
  fetchById: (id: string) => Promise<SentEmail | null>;

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

  // -------------------- SEND --------------------
  const sendToAll = useCallback(async (data: { subject?: string; message: string }) => {
    try {
      setLoading(true);
      await api.post("/emails", data);
      toast({ title: "Success", description: "Emails sent to all users" });
      await fetchAllSent();
      await fetchStats();
    } catch {
      toast({ title: "Error", description: "Failed to send emails", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  const sendToCategory = useCallback(async (category: string, data: { subject?: string; message: string }) => {
    try {
      setLoading(true);
      await api.post(`/emails/categories/${category}`, data);
      toast({ title: "Success", description: `Emails sent to ${category}` });
      await fetchAllSent();
      await fetchStats();
    } catch {
      toast({ title: "Error", description: "Failed to send emails", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  const sendToIndividual = useCallback(async (id: string, data: { subject?: string; message: string }) => {
    try {
      setLoading(true);
      await api.post(`/emails/${id}`, data);
      toast({ title: "Success", description: "Email sent to individual" });
      await fetchAllSent();
      await fetchStats();
    } catch {
      toast({ title: "Error", description: "Failed to send email", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  // -------------------- GET --------------------
  const fetchAllSent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/emails/sent");
      setEmails(res.data);
      setError(null);
    } catch {
      setError("Failed to fetch emails");
      toast({ title: "Error", description: "Failed to fetch emails", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
      return res.data;
    } catch {
      toast({ title: "Error", description: "Failed to fetch email", variant: "destructive" });
      return null;
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
