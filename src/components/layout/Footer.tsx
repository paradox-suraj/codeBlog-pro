import Link from "next/link";
import { Code2, Search } from "lucide-react";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

const platformLinks = [
  { label: "Blog", href: "/blog" },
  { label: "Categories", href: "/categories" },
  { label: "Authors", href: "/authors" },
  { label: "About", href: "/about" },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

export function Footer() {
  return (
    <footer className="border-t bg-background/88">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr_0.7fr_1.1fr]">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 font-bold tracking-tight">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Code2 className="h-5 w-5" />
              </span>
              CodeBlog Pro
            </Link>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              A developer publishing platform for practical engineering notes,
              tutorials, and field-tested technical stories.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <Search className="h-4 w-4" />
              Search the archive
            </Link>
          </div>

          <FooterLinkGroup title="Platform" links={platformLinks} />
          <FooterLinkGroup title="Policy" links={legalLinks} />

          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold uppercase text-foreground">
                Editorial digest
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Get new articles and platform updates in your inbox.
              </p>
            </div>
            <NewsletterForm compact />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} CodeBlog Pro.</p>
          <p>Built for developers who care about clear writing.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <nav aria-label={title} className="space-y-3">
      <h2 className="text-sm font-semibold uppercase text-foreground">{title}</h2>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
