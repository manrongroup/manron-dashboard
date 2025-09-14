"use client";

import React, { useState } from "react";
import { Plus, Mail, UserCog, UserCheck, Users } from "lucide-react";
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
import UsersTable from "@/components/tables/UsersTable";
import { useEmail } from "@/contexts/EmailContext"; // make sure this exists
import { UserForm } from "@/components/UserForm";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/RichTextEditor";
import { useUsers } from "@/contexts/UserContext";
import StatCard from "@/components/ui/stat-card";

export default function UserManagement() {
  const { users, agents, loading, deleteUser, deleteAgent, fetchUsers, fetchAgents } = useUsers();
  const { sendToAll, sendToCategory, sendToIndividual } = useEmail();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // create/edit dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  // email dialog
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailMode, setEmailMode] = useState<
    "all" | "agents" | "users_only" | "individual"
  >("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState(""); // HTML from RichTextEditor
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(""); // for individual
  const [sending, setSending] = useState(false);

  // Build a combined list for "individual" selection (users + agents), showing email & id
  const combined = [
    ...users.map((u) => ({ id: u.id || u._id, email: u.email, type: "user", raw: u })),
    ...agents.map((a) => ({ id: a.id || a._id, email: a.email, type: "agent", raw: a })),
  ];

  // ---------- email sending logic ----------
  const handleSend = async () => {
    if (!subject.trim() && !body.trim()) {
      toast({ title: "Error", description: "Subject or body is required", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      if (emailMode === "all") {
        // send to all people (backend endpoint that sends to all models)
        await sendToAll({ subject, message: body });
      } else if (emailMode === "agents") {
        // uses category 'agents' which your backend supports
        await sendToCategory("agents", { subject, message: body });
      } else if (emailMode === "users_only") {
        // backend doesn't have a single "users only" endpoint. send individually to each user id.
        // This will call your /emails/:id endpoint for each user id (your backend finds the user by id in models)
        await Promise.all(
          users.map((u) => sendToIndividual(u.id || u._id, { subject, message: body }))
        );
      } else if (emailMode === "individual") {
        if (!selectedRecipientId) throw new Error("Select an individual");
        await sendToIndividual(selectedRecipientId, { subject, message: body });
      }

      toast({ title: "Success", description: "Email(s) sent" });
      setIsEmailDialogOpen(false);
      setSubject("");
      setBody("");
      setSelectedRecipientId("");
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err?.message || "Failed to send", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  // delete handlers (confirm dialog)
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "agent") {
        await deleteAgent(deleteTarget.id);
        await fetchAgents();
      } else {
        await deleteUser(deleteTarget.id);
        await fetchUsers();
      }
      setDeleteTarget(null);
    } catch (err) {
      // errors are handled in context methods with toasts
    }
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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={users.length}
          icon={Users}
        />
        <StatCard
          title="Total Agents"
          value={agents.length}
          icon={UserCheck}
        />
        <StatCard
          title="All Accounts"
          value={users.length + agents.length}
          icon={UserCog}
        />
        <StatCard
          title="Average Users per Agent"
          value={
            agents.length > 0
              ? Math.round(users.length / agents.length)
              : 0
          }
          icon={UserCog}
        />

      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User & Agent Management</h1>
          <p className="text-muted-foreground mt-2">Users, Agents, and Emailing</p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.role === "superAdmin" && (
            <>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create User</DialogTitle>
                  </DialogHeader>
                  <UserForm
                    onSuccess={async () => {
                      setIsCreateDialogOpen(false);
                      await fetchUsers();
                    }}
                  />
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                onClick={() => {
                  setEmailMode("all");
                  setIsEmailDialogOpen(true);
                }}
              >
                <Mail className="mr-2 h-4 w-4" /> Email All
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setEmailMode("agents");
                  setIsEmailDialogOpen(true);
                }}
              >
                <Mail className="mr-2 h-4 w-4" /> Email Agents
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setEmailMode("users_only");
                  setIsEmailDialogOpen(true);
                }}
              >
                <Mail className="mr-2 h-4 w-4" /> Email Users Only
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Combined table (users + agents) */}
      <UsersTable
        users={[...users, ...agents].map((u) => ({ ...u, id: u.id || u._id }))}
        onEdit={(u) => {
          setSelectedUser(u);
          setIsEditDialogOpen(true);
        }}
        onDelete={(u) => {
          // table must pass user + type (we assume agent objects include a role 'agent')
          setDeleteTarget({ id: u.id || u._id, type: u.role === "agent" || u.isAgent ? "agent" : "user", email: u.email, fullname: u.fullname });
        }}
        onEmail={(u: any) => {
          setEmailMode("individual");
          setSelectedRecipientId(u.id || u._id);
          setIsEmailDialogOpen(true);
        }}
      />

      {/* Edit user dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              user={selectedUser}
              onSuccess={async () => {
                setIsEditDialogOpen(false);
                await fetchUsers();
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
            <AlertDialogTitle>Delete {deleteTarget?.type === "agent" ? "Agent" : "User"}</AlertDialogTitle>
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
      <Dialog open={isEmailDialogOpen} onOpenChange={() => setIsEmailDialogOpen(false)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {emailMode === "individual"
                ? `Email: ${combined.find((c) => c.id === selectedRecipientId)?.email ?? "Individual"}`
                : emailMode === "agents"
                  ? "Email Agents"
                  : emailMode === "users_only"
                    ? "Email Users Only"
                    : "Email All"}
            </DialogTitle>
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
              <Button
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? "Sending..." : "Send"}
              </Button>
              <Button variant="ghost" onClick={() => setIsEmailDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
