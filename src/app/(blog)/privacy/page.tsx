import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — CodeBlog Pro",
  description: "How CodeBlog Pro handles account, publishing, and newsletter data.",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-10 md:py-14">
      <article className="prose prose-neutral dark:prose-invert">
        <p className="text-sm font-semibold uppercase text-primary">Policy</p>
        <h1>Privacy Policy</h1>
        <p>Last updated: July 12, 2026</p>
        <p>
          CodeBlog Pro stores the account details, profile information, posts,
          comments, likes, bookmarks, and newsletter subscriptions needed to run
          the platform.
        </p>
        <h2>Information You Provide</h2>
        <p>
          Account and profile data may include your name, email address, avatar,
          bio, website, and social profile links. Publishing data includes post
          drafts, published articles, categories, tags, and uploaded cover images.
        </p>
        <h2>How Information Is Used</h2>
        <p>
          This information is used to authenticate users, display public author
          profiles, publish articles, power comments and engagement actions, and
          send newsletter updates when someone subscribes.
        </p>
        <h2>Public Content</h2>
        <p>
          Published posts, author names, public profile fields, comments, and
          engagement counts may be visible to readers. Draft posts remain part of
          the authoring workflow until they are published.
        </p>
        <h2>Operational Data</h2>
        <p>
          The platform may record article views and basic request metadata for
          analytics, abuse prevention, and reliability. External providers such
          as authentication, database, image upload, and email services may
          process data when they are configured for the deployment.
        </p>
      </article>
    </div>
  );
}
