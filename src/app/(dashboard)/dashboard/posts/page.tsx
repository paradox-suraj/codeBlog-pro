"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, ArrowUpDown, Eye, Heart, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  featured: boolean;
  views: number;
  createdAt: string;
  category: { name: string; color: string | null } | null;
  _count: { likes: number; comments: number };
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  SCHEDULED: "outline",
};

export default function DashboardPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    const res = await fetch(`/api/dashboard/posts?${params}`);
    const data = await res.json();
    setPosts(data.posts ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const res = await fetch(`/api/dashboard/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id], action: "delete" }),
    });
    if (res.ok) { toast.success("Post deleted"); fetchPosts(); }
    else toast.error("Failed to delete post");
  };

  const handleBulkAction = async (action: string) => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    const res = await fetch(`/api/dashboard/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, action }),
    });
    if (res.ok) {
      toast.success(`${ids.length} post(s) ${action}d`);
      setSelectedIds(new Set());
      fetchPosts();
    } else toast.error("Bulk action failed");
  };

  const columns: ColumnDef<Post>[] = [
    {
      id: "select",
      header: () => null,
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.original.id)}
          onChange={(e) => {
            const next = new Set(selectedIds);
            e.target.checked ? next.add(row.original.id) : next.delete(row.original.id);
            setSelectedIds(next);
          }}
          className="h-4 w-4 rounded border-gray-300"
        />
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3" onClick={() => column.toggleSorting()}>
          Title <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <Link href={`/dashboard/posts/${row.original.id}/edit`} className="font-medium hover:text-primary">
            {row.original.title}
          </Link>
          {row.original.featured && <Badge variant="outline" className="ml-2 text-xs">Featured</Badge>}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge variant={STATUS_VARIANT[row.original.status]}>{row.original.status}</Badge>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => row.original.category ? (
        <span className="text-sm">{row.original.category.name}</span>
      ) : <span className="text-muted-foreground text-sm">—</span>,
    },
    {
      accessorKey: "views",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3" onClick={() => column.toggleSorting()}>
          <Eye className="mr-1 h-3 w-3" /> Views <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="text-sm">{row.original.views.toLocaleString()}</span>,
    },
    {
      accessorKey: "_count.likes",
      header: () => <Heart className="h-4 w-4" />,
      cell: ({ row }) => <span className="text-sm">{row.original._count.likes}</span>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3" onClick={() => column.toggleSorting()}>
          Date <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{format(new Date(row.original.createdAt), "MMM d, yyyy")}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/posts/${row.original.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${row.original.slug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" /> View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Posts</h1>
          <p className="text-muted-foreground">Manage and organize your blog posts.</p>
        </div>
        <Button asChild className="rounded-full px-6 font-bold shadow-md">
          <Link href="/dashboard/posts/new">
            <Plus className="mr-2 h-4 w-4" /> New Post
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={posts}
        searchKey="title"
        searchPlaceholder="Search posts..."
        isLoading={loading}
        toolbar={
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 rounded-full bg-secondary/50 font-medium">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-muted-foreground mr-2">{selectedIds.size} selected</span>
                <Button size="sm" variant="outline" className="rounded-full font-bold" onClick={() => handleBulkAction("publish")}>Publish</Button>
                <Button size="sm" variant="outline" className="rounded-full font-bold" onClick={() => handleBulkAction("unpublish")}>Unpublish</Button>
                <Button size="sm" variant="destructive" className="rounded-full font-bold" onClick={() => handleBulkAction("delete")}>Delete</Button>
              </div>
            )}
          </>
        }
      />
    </div>
  );
}
