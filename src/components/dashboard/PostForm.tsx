"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { autosavePost } from "@/actions/post";
import { MDXEditor } from "@/components/editor/MDXEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { AIWritingAssistant } from "@/components/dashboard/AIWritingAssistant";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import slugify from "slugify";
import type { PostStatus } from "@prisma/client";
import { Loader2, Save } from "lucide-react";

interface PostFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    categoryId: string | null;
    seriesId: string | null;
    seriesOrder: number | null;
    status: PostStatus;
    featured: boolean;
  };
  categories: { id: string; name: string }[];
  series: { id: string; title: string }[];
}

export function PostForm({ initialData, categories, series }: PostFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    coverImage: initialData?.coverImage || "",
    categoryId: initialData?.categoryId || "",
    seriesId: initialData?.seriesId || "",
    seriesOrder: initialData?.seriesOrder || "",
    status: initialData?.status || "DRAFT",
    featured: initialData?.featured || false,
  });

  const lastSavedForm = useRef(form);
  const [lastAutosaved, setLastAutosaved] = useState<Date | null>(null);

  useEffect(() => {
    if (!initialData?.id) return;

    if (
      form.title === lastSavedForm.current.title &&
      form.content === lastSavedForm.current.content &&
      form.slug === lastSavedForm.current.slug &&
      form.excerpt === lastSavedForm.current.excerpt &&
      form.categoryId === lastSavedForm.current.categoryId &&
      form.seriesId === lastSavedForm.current.seriesId &&
      form.seriesOrder === lastSavedForm.current.seriesOrder
    ) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await autosavePost(initialData.id, {
          title: form.title,
          slug: form.slug,
          content: form.content,
          excerpt: form.excerpt,
          categoryId: form.categoryId || null,
          seriesId: form.seriesId || null,
          seriesOrder: form.seriesOrder ? Number(form.seriesOrder) : null,
        });
        if (res.success && res.timestamp) {
          lastSavedForm.current = form;
          setLastAutosaved(new Date(res.timestamp));
        }
      } catch (err) {
        console.error("Autosave failed", err);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [form, initialData?.id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((p) => ({
      ...p,
      title,
      slug: !initialData ? slugify(title, { lower: true, strict: true }) : p.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.content) {
      toast.error("Title, slug, and content are required.");
      return;
    }

    setSaving(true);
    try {
      const url = initialData ? `/api/dashboard/posts/${initialData.id}` : "/api/dashboard/posts/new";
      const method = initialData ? "PATCH" : "POST";
      
      const payload = {
        ...form,
        categoryId: form.categoryId || null,
        seriesId: form.seriesId || null,
        seriesOrder: form.seriesOrder ? Number(form.seriesOrder) : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save post");
      }

      toast.success(initialData ? "Post updated!" : "Post created!");
      router.push("/dashboard/posts");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save post";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{initialData ? "Edit Post" : "New Post"}</h1>
        <div className="flex items-center gap-4">
          <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as PostStatus }))}>
            <SelectTrigger className="w-[140px] rounded-full bg-secondary/50 font-medium">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex flex-col items-end gap-1">
            <Button type="submit" disabled={saving} className="rounded-full px-6 font-bold shadow-md">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving" : "Save Post"}
            </Button>
            {lastAutosaved && (
              <span className="text-[10px] text-muted-foreground pr-2">
                Autosaved at {format(lastAutosaved, "h:mm a")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-6 rounded-[32px] border-2 border-border bg-card p-8 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="Post title"
                className="text-lg font-bold rounded-full bg-secondary/50 px-5 border-none shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <MDXEditor
                value={form.content}
                onChange={(content) => setForm((p) => ({ ...p, content }))}
              />
              <AIWritingAssistant 
                currentContent={form.content} 
                onApplyContent={(newContent) => setForm((p) => ({ ...p, content: newContent }))} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-6 rounded-[32px] border-2 border-border bg-card p-8 shadow-sm">
            <h3 className="font-semibold">Publishing</h3>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                className="rounded-full bg-secondary/50 px-5 border-none shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm((p) => ({ ...p, categoryId: v }))}>
                <SelectTrigger className="rounded-full bg-secondary/50 font-medium">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="series">Series</Label>
              <Select value={form.seriesId} onValueChange={(v) => setForm((p) => ({ ...p, seriesId: v }))}>
                <SelectTrigger className="rounded-full bg-secondary/50 font-medium">
                  <SelectValue placeholder="Select series" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {series?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.seriesId && (
              <div className="space-y-2">
                <Label htmlFor="seriesOrder">Series Order (e.g. Part 1)</Label>
                <Input
                  id="seriesOrder"
                  type="number"
                  value={form.seriesOrder}
                  onChange={(e) => setForm((p) => ({ ...p, seriesOrder: e.target.value }))}
                  className="rounded-full bg-secondary/50 px-5 border-none shadow-sm"
                  placeholder="1"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between rounded-2xl border-2 border-border bg-secondary/30 p-5 shadow-sm">
              <div className="space-y-0.5">
                <Label>Featured Post</Label>
                <p className="text-xs text-muted-foreground">Show in featured section</p>
              </div>
              <Switch
                checked={form.featured}
                onCheckedChange={(v) => setForm((p) => ({ ...p, featured: v }))}
              />
            </div>
          </div>

          <div className="space-y-6 rounded-[32px] border-2 border-border bg-card p-8 shadow-sm">
            <h3 className="font-semibold">Cover Image</h3>
            <ImageUpload
              value={form.coverImage}
              onChange={(url) => setForm((p) => ({ ...p, coverImage: url }))}
              onRemove={() => setForm((p) => ({ ...p, coverImage: "" }))}
            />
          </div>

          <div className="space-y-6 rounded-[32px] border-2 border-border bg-card p-8 shadow-sm">
            <h3 className="font-semibold flex items-center justify-between">
              Excerpt
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={async () => {
                  if (!form.content || form.content.length < 50) {
                    toast.error("Please write some content first to generate an excerpt.");
                    return;
                  }
                  toast.promise(
                    fetch("/api/ai/assist", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ content: form.content }),
                    }).then(async (res) => {
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error);
                      return data.data;
                    }),
                    {
                      loading: "Generating excerpt...",
                      success: (data) => {
                        setForm((p) => ({ ...p, excerpt: data.excerpt }));
                        return `Generated excerpt and found tags: ${data.tags.join(", ")}`;
                      },
                      error: (err) => err.message,
                    }
                  );
                }}
              >
                Sparkles Generate
              </Button>
            </h3>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                rows={3}
                className="rounded-3xl bg-secondary/50 p-5 border-none shadow-sm resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
