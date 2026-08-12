import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="container flex min-h-[calc(100vh-140px)] flex-col items-center justify-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-8">
        <ShieldAlert className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        Access Denied
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        You do not have permission to view this page. The Dashboard and Admin panel require <strong>AUTHOR</strong> or <strong>ADMIN</strong> privileges. 
      </p>
      <Button asChild size="lg">
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  );
}
