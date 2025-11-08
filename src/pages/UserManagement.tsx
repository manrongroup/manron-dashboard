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
import { AgentForm } from "@/components/AgentForm";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/RichTextEditor";
import { useUsers } from "@/contexts/UserContext";
import StatCard from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function UserManagement() {
  const { users, agents, loading, deleteUser, deleteAgent, fetchUsers, fetchAgents } = useUsers();
  const { sendToAll, sendToCategory, sendToIndividual } = useEmail();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // create/edit dialogs for users
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [viewUser, setViewUser] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  // create/edit dialogs for agents
  const [isCreateAgentDialogOpen, setIsCreateAgentDialogOpen] = useState(false);
  const [isEditAgentDialogOpen, setIsEditAgentDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [viewAgent, setViewAgent] = useState<any | null>(null);
  const [deleteAgentTarget, setDeleteAgentTarget] = useState<any | null>(null);

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
      let result;
      if (emailMode === "all") {
        // send to all people (backend endpoint that sends to all models)
        result = await sendToAll({ subject, message: body });
      } else if (emailMode === "agents") {
        // uses category 'agents' which your backend supports
        result = await sendToCategory("agents", { subject, message: body });
      } else if (emailMode === "users_only") {
        // Send to all users individually
        const results = await Promise.all(
          users.map((u) => sendToIndividual(u.id || u._id, { subject, message: body }))
        );
        result = { emailRecordId: results[0]?.emailRecordId || "", message: `Emails are being sent to ${users.length} users` };
      } else if (emailMode === "individual") {
        if (!selectedRecipientId) throw new Error("Select an individual");
        result = await sendToIndividual(selectedRecipientId, { subject, message: body });
      }

      // Email is sent asynchronously - backend returns immediately
      toast({
        title: "Success",
        description: result?.message || "Email(s) are being sent. This may take a few moments.",
        duration: 5000
      });
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

  // delete handlers (confirm dialog) - superAdmin only for users
  const confirmDeleteUser = async () => {
    if (!deleteTarget || currentUser?.role !== "superAdmin") return;
    try {
      await deleteUser(deleteTarget.id);
      await fetchUsers();
      setDeleteTarget(null);
    } catch (err) {
      // errors are handled in context methods with toasts
    }
  };

  // delete handlers for agents - admin and superAdmin
  const confirmDeleteAgent = async () => {
    if (!deleteAgentTarget || (currentUser?.role !== "admin" && currentUser?.role !== "superAdmin")) return;
    try {
      await deleteAgent(deleteAgentTarget.id);
      await fetchAgents();
      setDeleteAgentTarget(null);
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
          <p className="text-muted-foreground mt-2">Manage system users and real estate agents separately</p>
        </div>

        {/* Admin and superAdmin can send emails */}
        {(currentUser?.role === "admin" || currentUser?.role === "superAdmin") && (
          <div className="flex items-center gap-2">
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
          </div>
        )}
      </div>

      {/* Tabs for Users and Agents */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">System Users ({users.length})</TabsTrigger>
          <TabsTrigger value="agents">Real Estate Agents ({agents.length})</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              System users can log in. Only superAdmin can create, update, or delete users.
            </p>
            {/* Only superAdmin can create users */}
            {currentUser?.role === "superAdmin" && (
              <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create System User</DialogTitle>
                  </DialogHeader>
                  <UserForm
                    onSuccess={async () => {
                      setIsCreateUserDialogOpen(false);
                      await fetchUsers();
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <UsersTable
            users={users.map((u) => ({ ...u, id: u.id || u._id }))}
            onEdit={(u) => {
              // Only superAdmin can edit users
              if (currentUser?.role === "superAdmin") {
                // Ensure user has both id and _id for compatibility
                const userToEdit = {
                  ...u,
                  id: u.id || u._id,
                  _id: u._id || u.id
                };
                setSelectedUser(userToEdit);
                setIsEditUserDialogOpen(true);
              }
            }}
            onDelete={(u) => {
              // Only superAdmin can delete users
              if (currentUser?.role === "superAdmin") {
                setDeleteTarget({ id: u.id || u._id, type: "user", email: u.email, fullname: u.fullname || "" });
              }
            }}
            onEmail={(u: any) => {
              if (currentUser?.role === "admin" || currentUser?.role === "superAdmin") {
                setEmailMode("individual");
                setSelectedRecipientId(u.id || u._id);
                setIsEmailDialogOpen(true);
              }
            }}
            onView={(u) => {
              const fullUser = users.find(user => (user.id || user._id) === (u.id || u._id)) || u;
              setViewUser(fullUser);
            }}
          />
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Real estate agents cannot log in. They are just a list for display. Admin and superAdmin can manage agents.
            </p>
            {/* Admin and superAdmin can create agents */}
            {(currentUser?.role === "admin" || currentUser?.role === "superAdmin") && (
              <Dialog open={isCreateAgentDialogOpen} onOpenChange={setIsCreateAgentDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Agent
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Real Estate Agent</DialogTitle>
                  </DialogHeader>
                  <AgentForm
                    onSuccess={async () => {
                      setIsCreateAgentDialogOpen(false);
                      await fetchAgents();
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <UsersTable
            users={agents.map((a) => ({ ...a, id: a.id || a._id, role: "agent" }))}
            onEdit={(a) => {
              // Admin and superAdmin can edit agents
              if (currentUser?.role === "admin" || currentUser?.role === "superAdmin") {
                // Ensure agent has both id and _id for compatibility
                const agentToEdit = {
                  ...a,
                  id: a.id || a._id,
                  _id: a._id || a.id
                };
                setSelectedAgent(agentToEdit);
                setIsEditAgentDialogOpen(true);
              }
            }}
            onDelete={(a) => {
              // Admin and superAdmin can delete agents
              if (currentUser?.role === "admin" || currentUser?.role === "superAdmin") {
                setDeleteAgentTarget({ id: a.id || a._id, type: "agent", email: a.email, fullname: a.fullname || "" });
              }
            }}
            onEmail={(a: any) => {
              if (currentUser?.role === "admin" || currentUser?.role === "superAdmin") {
                setEmailMode("individual");
                setSelectedRecipientId(a.id || a._id);
                setIsEmailDialogOpen(true);
              }
            }}
            onView={(a) => {
              const fullAgent = agents.find(agent => (agent.id || agent._id) === (a.id || a._id)) || a;
              setViewAgent(fullAgent);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Edit user dialog - superAdmin only */}
      <Dialog open={isEditUserDialogOpen && currentUser?.role === "superAdmin"} onOpenChange={(open) => {
        if (!open) {
          setIsEditUserDialogOpen(false);
          setSelectedUser(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit System User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              key={selectedUser.id || selectedUser._id} // Force re-render when user changes
              user={selectedUser}
              onSuccess={async () => {
                setIsEditUserDialogOpen(false);
                setSelectedUser(null);
                await fetchUsers();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit agent dialog - Admin and superAdmin */}
      <Dialog open={isEditAgentDialogOpen && (currentUser?.role === "admin" || currentUser?.role === "superAdmin")} onOpenChange={(open) => {
        if (!open) {
          setIsEditAgentDialogOpen(false);
          setSelectedAgent(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Real Estate Agent</DialogTitle>
          </DialogHeader>
          {selectedAgent && (
            <AgentForm
              key={selectedAgent.id || selectedAgent._id} // Force re-render when agent changes
              agent={selectedAgent}
              onSuccess={async () => {
                setIsEditAgentDialogOpen(false);
                setSelectedAgent(null);
                await fetchAgents();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete user confirm - superAdmin only */}
      {currentUser?.role === "superAdmin" && (
        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete System User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteTarget?.fullname || deleteTarget?.email}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive" onClick={confirmDeleteUser}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete agent confirm - Admin and superAdmin */}
      {(currentUser?.role === "admin" || currentUser?.role === "superAdmin") && (
        <AlertDialog open={!!deleteAgentTarget} onOpenChange={() => setDeleteAgentTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Real Estate Agent</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteAgentTarget?.fullname || deleteAgentTarget?.email}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive" onClick={confirmDeleteAgent}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

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

      {/* View User Details Dialog */}
      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-base font-semibold">{viewUser.fullname || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-base">
                    <a href={`mailto:${viewUser.email}`} className="text-blue-600 hover:underline">
                      {viewUser.email}
                    </a>
                  </p>
                </div>
                {viewUser.telephone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-base">
                      <a href={`tel:${viewUser.telephone}`} className="text-blue-600 hover:underline">
                        {viewUser.telephone}
                      </a>
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <p className="text-base">
                    <Badge variant={viewUser.role === 'superAdmin' ? 'default' : viewUser.role === 'admin' ? 'secondary' : 'outline'}>
                      {viewUser.role}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-base">
                    <Badge variant={viewUser.isActive ? 'default' : 'secondary'}>
                      {viewUser.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </p>
                </div>
                {viewUser.lastLogin && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                    <p className="text-base">
                      {new Date(viewUser.lastLogin).toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="text-base">
                    {new Date(viewUser.createdAt).toLocaleString()}
                  </p>
                </div>
                {viewUser.updatedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                    <p className="text-base">
                      {new Date(viewUser.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Agent Details Dialog */}
      <Dialog open={!!viewAgent} onOpenChange={() => setViewAgent(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agent Details</DialogTitle>
          </DialogHeader>
          {viewAgent && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-base font-semibold">{viewAgent.fullname || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-base">
                    <a href={`mailto:${viewAgent.email}`} className="text-blue-600 hover:underline">
                      {viewAgent.email}
                    </a>
                  </p>
                </div>
                {viewAgent.telephone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-base">
                      <a href={`tel:${viewAgent.telephone}`} className="text-blue-600 hover:underline">
                        {viewAgent.telephone}
                      </a>
                    </p>
                  </div>
                )}
                {viewAgent.title && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Title</label>
                    <p className="text-base">{viewAgent.title}</p>
                  </div>
                )}
                {viewAgent.company && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company</label>
                    <p className="text-base">{viewAgent.company}</p>
                  </div>
                )}
                {viewAgent.experience && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Experience</label>
                    <p className="text-base">{viewAgent.experience} years</p>
                  </div>
                )}
                {viewAgent.status && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p className="text-base">
                      <Badge variant={viewAgent.status === 'Active' ? 'default' : 'secondary'}>
                        {viewAgent.status}
                      </Badge>
                    </p>
                  </div>
                )}
                {viewAgent.rating && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rating</label>
                    <p className="text-base">{viewAgent.rating} / 5 ({viewAgent.totalReviews || 0} reviews)</p>
                  </div>
                )}
                {viewAgent.specializations && viewAgent.specializations.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Specializations</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {viewAgent.specializations.map((spec, idx) => (
                        <Badge key={idx} variant="outline">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {viewAgent.languages && viewAgent.languages.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Languages</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {viewAgent.languages.map((lang, idx) => (
                        <Badge key={idx} variant="secondary">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {viewAgent.serviceAreas && viewAgent.serviceAreas.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Service Areas</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {viewAgent.serviceAreas.map((area, idx) => (
                        <Badge key={idx} variant="outline">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {viewAgent.description && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <div className="mt-2 p-4 bg-muted rounded-lg">
                      <p className="text-base whitespace-pre-wrap">{viewAgent.description}</p>
                    </div>
                  </div>
                )}
                {viewAgent.photo && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Photo</label>
                    <img src={viewAgent.photo} alt={viewAgent.fullname} className="mt-2 rounded-lg w-32 h-32 object-cover" />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="text-base">
                    {new Date(viewAgent.createdAt).toLocaleString()}
                  </p>
                </div>
                {viewAgent.updatedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                    <p className="text-base">
                      {new Date(viewAgent.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
