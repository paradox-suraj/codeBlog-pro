import Link from "next/link";
import { Code2, LockKeyhole, PenLine } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen flex items-center justify-center py-10">
      <div className="container grid min-h-[calc(100vh-9rem)] items-center gap-12 px-4 md:px-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden rounded-[40px] border-2 border-border bg-secondary p-12 shadow-xl lg:block relative overflow-hidden">
          {/* Decorative Background Blob */}
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3 font-bold tracking-tight text-foreground text-lg">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Code2 className="h-6 w-6" />
              </span>
              CodeBlog Pro
            </Link>
            <h1 className="mt-12 text-5xl font-black tracking-tight text-foreground">
              Publish technical writing with the right account.
            </h1>
            <p className="mt-6 text-xl leading-8 text-muted-foreground">
              Sign in to write, discuss, bookmark, and manage your author dashboard.
            </p>
            <div className="mt-12 grid gap-4">
              <div className="flex gap-4 rounded-3xl border-2 border-border bg-card p-6 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <PenLine className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground text-lg">Author workflow</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Draft, publish, and edit posts from the protected dashboard.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 rounded-3xl border-2 border-border bg-card p-6 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <LockKeyhole className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground text-lg">Role-aware access</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Admin and author routes stay behind server-side permission checks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 font-bold tracking-tight text-xl">
              <Code2 className="h-8 w-8 text-primary" />
              CodeBlog Pro
            </Link>
          </div>
          {children}
          <p className="mt-8 text-center text-sm leading-relaxed text-muted-foreground">
            By continuing, you agree to the{" "}
            <Link href="/terms" className="font-bold text-foreground hover:text-primary transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-bold text-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
