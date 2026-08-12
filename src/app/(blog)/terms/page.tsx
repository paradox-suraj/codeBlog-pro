import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — CodeBlog Pro",
  description: "Terms for reading, writing, and participating on CodeBlog Pro.",
};

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-10 md:py-14">
      <article className="prose prose-neutral dark:prose-invert">
        <p className="text-sm font-semibold uppercase text-primary">Policy</p>
        <h1>Terms of Service</h1>
        <p>Last updated: July 12, 2026</p>
        <p>
          CodeBlog Pro is a publishing platform for technical writing. By using
          the platform, you agree to use it responsibly and to respect the work
          and accounts of other users.
        </p>
        <h2>Accounts</h2>
        <p>
          You are responsible for activity under your account. Author and admin
          areas are protected by role checks and should only be used for the
          publishing or moderation actions available to your account.
        </p>
        <h2>Content</h2>
        <p>
          Authors are responsible for the posts, images, code snippets, and
          comments they publish. Do not publish content you do not have the right
          to share, and do not use the platform for spam, abuse, or misleading
          technical claims.
        </p>
        <h2>Platform Changes</h2>
        <p>
          Features, routes, and policies may evolve as CodeBlog Pro changes.
          Existing backend permissions and role checks remain the source of truth
          for protected actions.
        </p>
        <h2>Availability</h2>
        <p>
          CodeBlog Pro depends on configured infrastructure such as the database,
          authentication providers, image storage, and email delivery. Availability
          may vary with those services and deployment settings.
        </p>
      </article>
    </div>
  );
}
