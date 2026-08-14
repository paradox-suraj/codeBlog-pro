import { requireAdmin } from "@/lib/auth-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = {
  title: "Site Settings - Admin Panel",
};

export default async function SettingsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Site Settings</h1>
        <p className="text-muted-foreground mt-2">Manage global platform configurations.</p>
      </div>

      <Card className="border-2 border-border shadow-sm">
        <CardHeader>
          <CardTitle>Environment Configuration</CardTitle>
          <CardDescription>
            These settings are currently configured via your environment variables (.env) or Vercel project settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Site Name</Label>
            <Input disabled value={process.env.NEXT_PUBLIC_SITE_NAME || "CodeBlog Pro"} className="bg-secondary/50" />
          </div>
          <div className="space-y-2">
            <Label>Admin Email (Auto-Promotion)</Label>
            <Input disabled value={process.env.ADMIN_EMAIL || "Not configured"} className="bg-secondary/50" />
          </div>
          <div className="space-y-2">
            <Label>Database URL</Label>
            <Input type="password" disabled value={process.env.DATABASE_URL ? "********" : ""} className="bg-secondary/50" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-2 border-border shadow-sm border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Advanced Management</CardTitle>
          <CardDescription>
            Developer tools and platform maintenance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Feature flag toggles and maintenance mode settings will appear here in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
