"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, Trash2, Shield, User } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserType = {
  id: string;
  name: string | null;
  email: string | null;
  role: "ADMIN" | "AUTHOR" | "READER";
  image: string | null;
  createdAt: string;
  _count: { posts: number };
};

const ROLE_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  ADMIN: "destructive",
  AUTHOR: "default",
  READER: "secondary",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/users`);
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (id: string, role: string) => {
    const res = await fetch(`/api/admin/users?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) { toast.success("Role updated"); fetchUsers(); }
    else toast.error("Failed to update role");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user and all their posts? This is permanent.")) return;
    const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("User deleted"); fetchUsers(); }
    else toast.error("Failed to delete user");
  };

  const columns: ColumnDef<UserType>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3" onClick={() => column.toggleSorting()}>
          User <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.image ?? ""} />
            <AvatarFallback>{row.original.name?.charAt(0) ?? "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name ?? "Unnamed User"}</span>
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <Badge variant={ROLE_VARIANT[row.original.role]}>{row.original.role}</Badge>,
    },
    {
      accessorKey: "_count.posts",
      header: "Posts",
      cell: ({ row }) => <span className="text-sm">{row.original._count.posts}</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
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
            <DropdownMenuItem onClick={() => handleRoleChange(row.original.id, "ADMIN")}>
              <Shield className="mr-2 h-4 w-4" /> Make Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange(row.original.id, "AUTHOR")}>
              <User className="mr-2 h-4 w-4" /> Make Author
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange(row.original.id, "READER")}>
              <User className="mr-2 h-4 w-4" /> Make Reader
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage platform users and roles.</p>
      </div>
      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Search users..."
        isLoading={loading}
      />
    </div>
  );
}
