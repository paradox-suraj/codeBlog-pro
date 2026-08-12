import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — CodeBlog Pro",
  description: "How CodeBlog Pro uses cookies and session storage.",
};

export default function CookiesPage() {
  return (
    <div className="container max-w-3xl py-10 md:py-14">
      <article className="prose prose-neutral dark:prose-invert">
        <p className="text-sm font-semibold uppercase text-primary">Policy</p>
        <h1>Cookie Policy</h1>
        <p>Last updated: July 12, 2026</p>
        <p>
          CodeBlog Pro uses essential cookies and local browser storage for
          authentication, session state, theme preference, and basic application
          behavior.
        </p>
        <h2>Essential Cookies</h2>
        <p>
          Authentication cookies keep users signed in and protect dashboard,
          author, and admin routes. These cookies are required for account-based
          features.
        </p>
        <h2>Preferences</h2>
        <p>
          Theme preference may be stored in the browser so the interface can
          reopen in the selected light, dark, or system mode.
        </p>
        <h2>Third-Party Services</h2>
        <p>
          Configured authentication, hosting, analytics, image, or email services
          may set their own cookies or process request metadata depending on the
          deployment.
        </p>
      </article>
    </div>
  );
}
