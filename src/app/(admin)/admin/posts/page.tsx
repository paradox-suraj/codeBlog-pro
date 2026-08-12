"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, Eye, Trash2, Star, StarOff } from "lucide-react";
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
import { toast } from "sonner";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: string;
  featured: boolean;
  views: number;
  createdAt: string;
  author: { name: string; email: string };
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  SCHEDULED: "outline",
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/posts`);
    const data = await res.json();
    setPosts(data.posts ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleToggleFeature = async (id: string, featured: boolean) => {
    const res = await fetch(`/api/admin/posts?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured }),
    });
    if (res.ok) { toast.success("Post updated"); fetchPosts(); }
    else toast.error("Failed to update post");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post globally?")) return;
    const res = await fetch(`/api/admin/posts?id=${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Post deleted"); fetchPosts(); }
    else toast.error("Failed to delete post");
  };

  const columns: ColumnDef<Post>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link href={`/${row.original.slug}`} target="_blank" className="font-medium hover:text-primary">
            {row.original.title}
          </Link>
          <span className="text-xs text-muted-foreground">{row.original.author.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[row.original.status]}>{row.original.status}</Badge>
          {row.original.featured && <Badge variant="outline" className="text-xs">Featured</Badge>}
        </div>
      ),
    },
    {
      accessorKey: "views",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3" onClick={() => column.toggleSorting()}>
          Views <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="text-sm">{row.original.views.toLocaleString()}</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
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
              <Link href={`/${row.original.slug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" /> View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleFeature(row.original.id, !row.original.featured)}>
              {row.original.featured ? <StarOff className="mr-2 h-4 w-4" /> : <Star className="mr-2 h-4 w-4" />}
              {row.original.featured ? "Unfeature" : "Feature"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Global
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Posts</h1>
        <p className="text-muted-foreground">Manage all posts across the platform.</p>
      </div>
      <DataTable
        columns={columns}
        data={posts}
        searchKey="title"
        searchPlaceholder="Search posts..."
        isLoading={loading}
      />
    </div>
  );
}
