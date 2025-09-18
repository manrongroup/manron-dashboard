"use client";

import React, { useState } from "react";
import { Plus, Mail, UserCheck, Users, Star, MessageSquare, Award, Building, Briefcase, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useEmail } from "@/contexts/EmailContext";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/contexts/UserContext";
import UsersTable from "@/components/tables/UsersTable";
import { UserForm } from "@/components/UserForm";
import RichTextEditor from "@/components/RichTextEditor";
import StatCard from "@/components/ui/stat-card";

export default function AgentManagement() {
    const { agents, loading, createAgent, updateAgent, deleteAgent, fetchAgents } = useUsers();
    const { sendToCategory, sendToIndividual } = useEmail();
    const { user: currentUser } = useAuth();
    const { toast } = useToast();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [selectedRecipientId, setSelectedRecipientId] = useState<string>("");
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!subject.trim() && !body.trim()) {
            toast({ title: "Error", description: "Subject or body is required", variant: "destructive" });
            return;
        }
        setSending(true);
        try {
            if (selectedRecipientId) {
                await sendToIndividual(selectedRecipientId, { subject, message: body });
            } else {
                await sendToCategory("agents", { subject, message: body });
            }
            toast({ title: "Success", description: "Email sent to agents" });
            setIsEmailDialogOpen(false);
            setSubject("");
            setBody("");
            setSelectedRecipientId("");
        } catch (err: any) {
            toast({ title: "Error", description: err?.message || "Failed to send", variant: "destructive" });
        } finally {
            setSending(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteAgent(deleteTarget.id);
            await fetchAgents();
            setDeleteTarget(null);
        } catch { }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Stats */}
            {/* Stats Section */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Agents */}
                <StatCard
                    title="Total Agents"
                    value={agents.length}
                    icon={Users}
                />

                {/* Active Agents */}
                <StatCard
                    title="Active Agents"
                    value={agents.filter(a => a.status === "Active").length}
                    icon={UserCheck}
                />

                {/* Average Rating */}
                <StatCard
                    title="Avg. Rating"
                    value={(agents.reduce((sum, a) => sum + (a.rating || 0), 0) / agents.length).toFixed(1)}
                    icon={Star}
                />

                {/* Total Reviews */}
                <StatCard
                    title="Total Reviews"
                    value={agents.reduce((sum, a) => sum + (a.totalReviews || 0), 0)}
                    icon={MessageSquare}
                />

           
            </div>



            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Agent Management</h1>
                    <p className="text-muted-foreground mt-2">Manage agents and send emails</p>
                </div>

                <div className="flex items-center gap-2">
                    {currentUser?.role === "superAdmin" && (
                        <>
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" /> Add Agent
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Create Agent</DialogTitle>
                                    </DialogHeader>
                                    <UserForm
                                        isAgentForm
                                        onSuccess={async () => {
                                            setIsCreateDialogOpen(false);
                                            await fetchAgents();
                                        }}
                                    />
                                </DialogContent>
                            </Dialog>

                            <Button
                                variant="outline"
                                onClick={() => setIsEmailDialogOpen(true)}
                            >
                                <Mail className="mr-2 h-4 w-4" /> Email Agents
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Table (only agents) */}
            <UsersTable
                users={agents.map((a) => ({ ...a, id: a.id || a._id, role: "agent" }))}
                onEdit={(a) => {
                    setSelectedAgent(a);
                    setIsEditDialogOpen(true);
                }}
                onDelete={(a) => setDeleteTarget({ id: a.id || a._id, type: "agent", email: a.email, fullname: a.fullname })}
                onEmail={(a) => {
                    setSelectedRecipientId(a.id || a._id);
                    setIsEmailDialogOpen(true);
                }}
            />

            {/* Edit agent dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Agent</DialogTitle>
                    </DialogHeader>
                    {selectedAgent && (
                        <UserForm
                            isAgentForm
                            user={selectedAgent}
                            onSuccess={async () => {
                                setIsEditDialogOpen(false);
                                await fetchAgents();
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete confirm */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deleteTarget?.fullname || deleteTarget?.email}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive" onClick={confirmDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Email dialog */}
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Email Agents</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <input
                            className="w-full border rounded p-2"
                            placeholder="Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                        <RichTextEditor value={body} onChange={setBody} height="300px" />
                        <div className="flex gap-2">
                            <Button onClick={handleSend} disabled={sending}>
                                {sending ? "Sending..." : "Send"}
                            </Button>
                            <Button variant="ghost" onClick={() => setIsEmailDialogOpen(false)}>Cancel</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
