"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, XCircle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/DataTable";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  active: boolean;
  confirmed: boolean;
  subscribedAt: string;
};

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [newsletter, setNewsletter] = useState({ subject: "", content: "" });

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/newsletter`);
    const data = await res.json();
    setSubscribers(data.subscribers ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const handleUnsubscribe = async (id: string) => {
    if (!confirm("Manually unsubscribe this user?")) return;
    const res = await fetch(`/api/admin/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { toast.success("Unsubscribed"); fetchSubs(); }
    else toast.error("Failed to unsubscribe");
  };

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletter.subject || !newsletter.content) {
      toast.error("Subject and content are required.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`/api/admin/newsletter/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsletter),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Newsletter sent successfully to ${data.sentCount} subscribers!`);
      setSendDialogOpen(false);
      setNewsletter({ subject: "", content: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to send newsletter.");
    } finally {
      setSending(false);
    }
  };

  const columns: ColumnDef<Subscriber>[] = [
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3" onClick={() => column.toggleSorting()}>
          Email <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.email}</span>
          {row.original.name && <span className="text-xs text-muted-foreground">{row.original.name}</span>}
        </div>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.active ? "default" : "secondary"}>
          {row.original.active ? "Active" : "Unsubscribed"}
        </Badge>
      ),
    },
    {
      accessorKey: "confirmed",
      header: "Confirmed",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.confirmed ? "Yes" : "No"}</span>
      ),
    },
    {
      accessorKey: "subscribedAt",
      header: "Subscribed Date",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{format(new Date(row.original.subscribedAt), "MMM d, yyyy")}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => row.original.active ? (
        <Button variant="ghost" size="sm" className="rounded-full shadow-sm font-bold" onClick={() => handleUnsubscribe(row.original.id)}>
          <XCircle className="mr-2 h-4 w-4" /> Unsubscribe
        </Button>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Newsletter</h1>
          <p className="text-muted-foreground">Manage email subscribers and send updates.</p>
        </div>
        
        <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full font-bold shadow-md">
              <Send className="mr-2 h-4 w-4" />
              Compose Newsletter
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSendNewsletter}>
              <DialogHeader>
                <DialogTitle>Send Newsletter</DialogTitle>
                <DialogDescription>
                  This will broadcast an email to all {subscribers.filter(s => s.active).length} active subscribers.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="Weekly Tech Digest" 
                    value={newsletter.subject}
                    onChange={(e) => setNewsletter({ ...newsletter, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">HTML Content</Label>
                  <Textarea 
                    id="content" 
                    placeholder="<h1>Hello!</h1>..." 
                    rows={10}
                    value={newsletter.content}
                    onChange={(e) => setNewsletter({ ...newsletter, content: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setSendDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={sending}>
                  {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Blast Email
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <DataTable
        columns={columns}
        data={subscribers}
        searchKey="email"
        searchPlaceholder="Search email..."
        isLoading={loading}
      />
    </div>
  );
}
