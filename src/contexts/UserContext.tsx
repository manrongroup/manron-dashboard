"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";

interface UsersContextType {
    users: User[];
    agents: User[];
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
    const [agents, setAgents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // 🔹 Fetch users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/users");
            const mapped = res.data.map((u: any) => ({ ...u, id: u._id }));
            setUsers(mapped);
        } catch {
            toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Fetch agents
    const fetchAgents = async () => {
        setLoading(true);
        try {
            const res = await api.get("/realestate/agents");
            const mapped = res.data.data.map((a: any) => ({ ...a, id: a._id }));
            setAgents(mapped);
        } catch {
            toast({ title: "Error", description: "Failed to fetch agents", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // 🔹 User CRUD
    const createUser = async (data: Partial<User>) => {
        try {
            await api.post("/users", data);
            await fetchUsers();
            toast({ title: "Success", description: "User created successfully" });
        } catch {
            toast({ title: "Error", description: "Failed to create user", variant: "destructive" });
        }
    };

    const updateUser = async (id: string, data: Partial<User>) => {
        try {
            await api.put(`/users/${id}`, data);
            await fetchUsers();
            toast({ title: "Success", description: "User updated successfully" });
        } catch {
            toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
        }
    };

    const deleteUser = async (id: string) => {
        try {
            await api.delete(`/users/${id}`);
            setUsers((prev) => prev.filter((u) => u.id !== id));
            toast({ title: "Success", description: "User deleted successfully" });
        } catch {
            toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
        }
    };

    // 🔹 Agent CRUD
    const createAgent = async (data: FormData) => {
        try {
            await api.post("/realestate/agents", data, { headers: { "Content-Type": "multipart/form-data" } });
            await fetchAgents();
            toast({ title: "Success", description: "Agent created successfully" });
        } catch {
            toast({ title: "Error", description: "Failed to create agent", variant: "destructive" });
        }
    };

    const updateAgent = async (id: string, data: FormData) => {
        try {
            await api.put(`/realestate/agents/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
            await fetchAgents();
            toast({ title: "Success", description: "Agent updated successfully" });
        } catch {
            toast({ title: "Error", description: "Failed to update agent", variant: "destructive" });
        }
    };

    const deleteAgent = async (id: string) => {
        try {
            await api.delete(`/realestate/agents/${id}`);
            setAgents((prev) => prev.filter((a) => a.id !== id));
            toast({ title: "Success", description: "Agent deleted successfully" });
        } catch {
            toast({ title: "Error", description: "Failed to delete agent", variant: "destructive" });
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
