import { NewsletterForm } from "@/components/forms/NewsletterForm";

export function NewsletterSection() {
  return (
    <section className="overflow-hidden rounded-lg border bg-card/92 shadow-soft">
      <div className="grid gap-8 p-6 md:grid-cols-[1fr_0.9fr] md:p-10 lg:p-12">
        <div>
          <p className="text-sm font-semibold uppercase text-primary">Newsletter</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
            Keep a calm pulse on the archive.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Get new articles and platform updates from CodeBlog Pro in a low-noise editorial digest.
          </p>
        </div>
        <div className="rounded-lg border bg-background/70 p-5">
          <NewsletterForm buttonLabel="Join the list" />
        </div>
      </div>
    </section>
  );
}
