import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Code2, MessageSquare, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About — CodeBlog Pro",
  description: "Learn what CodeBlog Pro is and what kind of technical writing belongs here.",
};

export default function AboutPage() {
  return (
    <div className="container py-10 md:py-14">
      <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-primary">About CodeBlog Pro</p>
          <h1 className="mt-2 text-balance text-4xl font-black tracking-tight md:text-5xl">
            A home for practical developer writing.
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            CodeBlog Pro is built for engineers, technical founders, and builders who want to publish useful implementation notes, tutorials, design decisions, and lessons from production work.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/blog">
                <BookOpen className="h-4 w-4" />
                Read articles
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">
                <PenLine className="h-4 w-4" />
                Start writing
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card/88 p-6 shadow-soft">
          <h2 className="text-2xl font-bold tracking-tight">What belongs here</h2>
          <div className="mt-6 grid gap-4">
            {[
              {
                icon: Code2,
                title: "Implementation detail",
                text: "Walkthroughs, architecture choices, debugging notes, and code-heavy explanations.",
              },
              {
                icon: BookOpen,
                title: "Clear editorial structure",
                text: "Posts should help readers understand the tradeoffs, not just copy a snippet.",
              },
              {
                icon: MessageSquare,
                title: "Community discussion",
                text: "Comments are part of the reading experience, especially when details need refinement.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 rounded-lg border bg-background/65 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
