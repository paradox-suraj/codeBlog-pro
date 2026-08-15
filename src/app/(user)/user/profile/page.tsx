"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { toast } from "sonner";
import { Globe, Github, Twitter, Linkedin, MapPin } from "lucide-react";
import { TagInput } from "@/components/ui/tag-input";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    website: "",
    twitter: "",
    github: "",
    linkedin: "",
    avatar: "",
    location: "",
    skills: [] as string[],
    experience: "",
  });

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/auth/profile");
        if (!response.ok) throw new Error();
        const data = (await response.json()) as { profile: typeof form };
        if (active) setForm(data.profile);
      } catch {
        if (session?.user && active) {
          setForm((prev) => ({
            ...prev,
            name: session.user.name ?? "",
            avatar: session.user.image ?? "",
          }));
        }
        toast.error("Could not load saved profile details.");
      } finally {
        if (active) setLoadingProfile(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [session?.user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      await update({ name: form.name, image: form.avatar });
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Update your public profile information.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" aria-busy={loadingProfile}>
        {/* Avatar */}
        <div className="rounded-[32px] border-2 border-border bg-card p-8 shadow-sm">
          <h2 className="mb-4 font-semibold">Profile Photo</h2>
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={form.avatar} />
              <AvatarFallback className="text-2xl">{form.name?.charAt(0) ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <ImageUpload
                value={form.avatar}
                onChange={(url) => setForm((p) => ({ ...p, avatar: url }))}
                onRemove={() => setForm((p) => ({ ...p, avatar: "" }))}
              />
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="rounded-[32px] border-2 border-border bg-card p-8 space-y-6 shadow-sm">
          <h2 className="font-semibold">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
                disabled={loadingProfile || saving}
                className="rounded-full bg-secondary/50 px-5 border-none shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="San Francisco, CA"
                  disabled={loadingProfile || saving}
                  className="rounded-full bg-secondary/50 pl-11 pr-5 border-none shadow-sm"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Tell readers about yourself..."
              rows={4}
              disabled={loadingProfile || saving}
              className="rounded-3xl bg-secondary/50 p-5 border-none shadow-sm resize-none"
            />
          </div>
        </div>

        {/* Developer Identity */}
        <div className="rounded-[32px] border-2 border-border bg-card p-8 space-y-6 shadow-sm">
          <h2 className="font-semibold">Developer Identity</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tech Stack / Skills</Label>
              <TagInput
                tags={form.skills}
                setTags={(skills) => setForm((p) => ({ ...p, skills }))}
                placeholder="e.g., React, TypeScript, Node.js"
                disabled={loadingProfile || saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience & Background</Label>
              <Textarea
                id="experience"
                value={form.experience}
                onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))}
                placeholder="Describe your technical journey, past roles, or open source contributions..."
                rows={5}
                disabled={loadingProfile || saving}
                className="rounded-3xl bg-secondary/50 p-5 border-none shadow-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-[32px] border-2 border-border bg-card p-8 space-y-6 shadow-sm">
          <h2 className="font-semibold">Social Links</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { key: "website", icon: Globe, placeholder: "https://yourwebsite.com", label: "Website" },
              { key: "twitter", icon: Twitter, placeholder: "@username", label: "Twitter / X" },
              { key: "github", icon: Github, placeholder: "username", label: "GitHub" },
              { key: "linkedin", icon: Linkedin, placeholder: "linkedin.com/in/username", label: "LinkedIn" },
            ].map(({ key, icon: Icon, placeholder, label }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </Label>
                <Input
                  id={key}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  disabled={loadingProfile || saving}
                  className="rounded-full bg-secondary/50 px-5 border-none shadow-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving || loadingProfile} className="min-w-[160px] rounded-full font-bold shadow-md">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
