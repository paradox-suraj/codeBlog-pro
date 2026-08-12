"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/DataTable";
import { toast } from "sonner";

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Newsletter</h1>
        <p className="text-muted-foreground">Manage email subscribers.</p>
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
