"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { User, Agent } from "@/types";

interface UsersContextType {
    users: User[];
    agents: Agent[];
    loading: boolean;
    fetchUsers: () => Promise<void>;
    fetchAgents: () => Promise<void>;
    createUser: (data: Partial<User>) => Promise<void>;
    updateUser: (id: string, data: Partial<User>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    createAgent: (data: FormData) => Promise<void>;
    updateAgent: (id: string, data: FormData) => Promise<void>;
    deleteAgent: (id: string) => Promise<void>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: React.ReactNode }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // 🔹 Fetch users (admin & superAdmin only)
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/users");
            // Backend returns { success, data, message } or direct array
            const userData = res.data.data || res.data;
            const mapped = (Array.isArray(userData) ? userData : []).map((u: any) => ({
                ...u,
                id: u._id || u.id
            }));
            setUsers(mapped);
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to fetch users";
            toast({ title: "Error", description: message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Fetch agents (public endpoint - no auth needed)
    const fetchAgents = async () => {
        setLoading(true);
        try {
            const res = await api.get("/realestate/agents");
            // Backend returns { success, data, message } or direct array
            const agentData = res.data.data || res.data;
            const mapped = (Array.isArray(agentData) ? agentData : []).map((a: any) => ({
                ...a,
                id: a._id || a.id
            }));
            setAgents(mapped);
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to fetch agents";
            toast({ title: "Error", description: message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // 🔹 User CRUD (superAdmin only)
    const createUser = async (data: Partial<User>) => {
        try {
            await api.post("/signup", data);
            await fetchUsers();
            toast({ title: "Success", description: "User created successfully" });
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to create user";
            toast({ title: "Error", description: message, variant: "destructive" });
        }
    };

    const updateUser = async (id: string, data: Partial<User>) => {
        try {
            await api.put(`/users/update/${id}`, data);
            await fetchUsers();
            toast({ title: "Success", description: "User updated successfully" });
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to update user";
            toast({ title: "Error", description: message, variant: "destructive" });
        }
    };

    const deleteUser = async (id: string) => {
        try {
            await api.delete(`/users/delete/${id}`);
            setUsers((prev) => prev.filter((u) => u.id !== id && u._id !== id));
            toast({ title: "Success", description: "User deleted successfully" });
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to delete user";
            toast({ title: "Error", description: message, variant: "destructive" });
        }
    };

    // 🔹 Agent CRUD (admin & superAdmin)
    const createAgent = async (data: FormData) => {
        try {
            // Don't set Content-Type header - browser will set it with boundary
            await api.post("/realestate/agents", data);
            await fetchAgents();
            toast({ title: "Success", description: "Agent created successfully" });
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to create agent";
            toast({ title: "Error", description: message, variant: "destructive" });
        }
    };

    const updateAgent = async (id: string, data: FormData) => {
        try {
            // Don't set Content-Type header - browser will set it with boundary
            await api.put(`/realestate/agents/${id}`, data);
            await fetchAgents();
            toast({ title: "Success", description: "Agent updated successfully" });
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to update agent";
            toast({ title: "Error", description: message, variant: "destructive" });
        }
    };

    const deleteAgent = async (id: string) => {
        try {
            await api.delete(`/realestate/agents/${id}`);
            setAgents((prev) => prev.filter((a) => (a.id !== id && a._id !== id)));
            toast({ title: "Success", description: "Agent deleted successfully" });
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to delete agent";
            toast({ title: "Error", description: message, variant: "destructive" });
        }
    };

    // Initial load (only if authenticated)
    useEffect(() => {
        const hasToken = !!localStorage.getItem('token');
        if (!hasToken) {
            setLoading(false);
            return;
        }
        fetchUsers();
        fetchAgents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <UsersContext.Provider
            value={{
                users,
                agents,
                loading,
                fetchUsers,
                fetchAgents,
                createUser,
                updateUser,
                deleteUser,
                createAgent,
                updateAgent,
                deleteAgent,
            }}
        >
            {children}
        </UsersContext.Provider>
    );
};

export const useUsers = () => {
    const ctx = useContext(UsersContext);
    if (!ctx) throw new Error("useUsers must be used inside UsersProvider");
    return ctx;
};
