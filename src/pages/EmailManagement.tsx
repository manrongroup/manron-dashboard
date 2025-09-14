"use client";

import React, { useEffect, useState } from "react";
import { Mail, Send, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmail } from "@/contexts/EmailContext";
import { useToast } from "@/components/ui/use-toast";

import StatCard from "@/components/ui/stat-card";
import RichTextEditor from "@/components/RichTextEditor";
import EmailTable from "@/components/tables/EmailsTable";
import { api } from "@/lib/api";
import { useUsers } from "@/contexts/UserContext";

export default function EmailManagement() {
  const { emails, fetchAllSent, sendToAll, sendToCategory, sendToIndividual } = useEmail();

  const { toast } = useToast();

  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [sendMode, setSendMode] = useState<"all" | "category" | "individual">("all");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("companies");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // For individual mode
  const [selectedEmail, setSelectedEmail] = useState<any>(null); // for preview dialog
  const { users, agents } = useUsers();
  useEffect(() => {
    fetchAllSent();

  }, [fetchAllSent]);


  const handleSendEmail = async () => {
    if (!message.trim()) {
      toast({ title: "Error", description: "Message cannot be empty", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (sendMode === "all") {
        await sendToAll({ subject, message });
      } else if (sendMode === "category") {
        await sendToCategory(selectedCategory, { subject, message });
      } else if (sendMode === "individual" && selectedUser) {
        await sendToIndividual(selectedUser, { subject, message });
      }
      toast({ title: "Success", description: "Email sent successfully!" });
      setIsSendDialogOpen(false);
      setSubject("");
      setMessage("");
      setSelectedUser("");
    } catch {
      toast({ title: "Error", description: "Failed to send email", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // 📊 Statistics
  const stats = {
    total: emails.length,
    sent: emails.filter((e) => e.status === "sent").length,
    failed: emails.filter((e) => e.status === "failed").length,
    categories: [...new Set(emails.map((e) => e.category))].length,
  };

  console.log("agents", agents)
  console.log("users:", users)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Management</h1>
          <p className="text-muted-foreground">Manage sent emails and send new ones</p>
        </div>
        <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Mail className="mr-2 h-4 w-4" /> New Email
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Email</DialogTitle>
            </DialogHeader>

            {/* Mode Selector */}
            <Select value={sendMode} onValueChange={(val: any) => setSendMode(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose Send Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Send to All</SelectItem>
                <SelectItem value="category">Send to Category</SelectItem>
                <SelectItem value="individual">Send to Individual</SelectItem>
              </SelectContent>
            </Select>

            {sendMode === "category" && (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="companies">Companies</SelectItem>
                  <SelectItem value="consults">Consults</SelectItem>
                  <SelectItem value="agents">Agents</SelectItem>
                  <SelectItem value="interns">Interns</SelectItem>
                </SelectContent>
              </Select>
            )}

            {sendMode === "individual" && (
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select User or Agent" />
                </SelectTrigger>
                <SelectContent>
                  {[...users, ...agents].map((u) => (
                    <SelectItem
                      key={u._id || u.id}
                      value={u._id || u.id}
                    >
                      {u.email} {u.role ? `(${u.role})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-2"
            />

            <RichTextEditor value={message} onChange={setMessage} height="250px" className="mb-5" />

            <Button onClick={handleSendEmail} disabled={loading}>
              {loading ? "Sending..." : <><Send className="mr-2 h-4 w-4" /> Send</>}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Emails" value={stats.total} icon={Mail} />
        <StatCard title="Sent" value={stats.sent} icon={Send} />
        <StatCard title="Failed" value={stats.failed} icon={Trash2} />
        <StatCard title="Categories" value={stats.categories} icon={Users} />
      </div>

      {/* Emails Table */}
      <EmailTable
        emails={emails}
        onDelete={(id) => toast({ title: "Delete", description: `Delete email ${id}` })}
        onView={(email) => setSelectedEmail(email)} // ✅ preview dialog
      />

      {/* Email Preview Dialog */}
      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedEmail?.subject}</DialogTitle>
          </DialogHeader>
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: selectedEmail?.message || "" }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
