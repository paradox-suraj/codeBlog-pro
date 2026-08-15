import type { Metadata, Viewport } from "next";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AICopilotWrapper } from "@/components/ai/AICopilotWrapper";
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";

// ─────────────────────────────────────────────────────────────────────────────
// METADATA DEFAULTS
// These are baseline values. Each page/layout can override specific fields
// via its own exported `metadata` object or `generateMetadata` function.
const getAppUrl = () => {
  let url = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "http://localhost:3000";
  if (!url.startsWith("http")) {
    url = `https://${url}`;
  }
  return url;
};

const APP_URL = getAppUrl();
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "CodeBlog Pro";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${SITE_NAME} — Developer Blog Platform`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "A production-grade, multi-author developer blog platform. Write in MDX, publish instantly, build your audience.",
  keywords: [
    "developer blog",
    "programming",
    "typescript",
    "nextjs",
    "web development",
    "open source",
  ],
  authors: [{ name: SITE_NAME, url: APP_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Developer Blog Platform`,
    description:
      "A production-grade, multi-author developer blog platform.",
    images: [
      {
        url: `${APP_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Developer Blog Platform`,
    description: "A production-grade, multi-author developer blog platform.",
    images: [`${APP_URL}/api/og`],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: APP_URL,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)",  color: "#080d1a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch session server-side so it's available to all child server components
  // without requiring an additional API call.
  const session = await auth();

  return (
    <html
      lang="en"
      suppressHydrationWarning // Required by next-themes to avoid mismatch
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextTopLoader
          color="#3b82f6"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #3b82f6,0 0 5px #3b82f6"
        />
        {/*
         * SessionProvider: Makes the Auth.js session available to Client
         * Components via useSession() hook without additional fetches.
         *
         * Passing the server-fetched `session` prop avoids an extra roundtrip
         * on initial load.
         */}
        <SessionProvider session={session}>
          {/*
           * ThemeProvider: next-themes handles dark mode class toggling.
           * `attribute="class"` adds/removes `dark` class on <html>.
           * `disableTransitionOnChange` prevents flash during theme switch.
           */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col bg-background">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>

            <AICopilotWrapper role={session?.user?.role} />

            {/*
             * Sonner Toaster: Globally renders toast notifications.
             * Individual toasts are fired via `toast()` from sonner.
             */}
            <Toaster
              position="bottom-right"
              richColors
              closeButton
              toastOptions={{
                duration: 4000,
                classNames: {
                  toast: "font-sans text-sm",
                  title: "font-semibold",
                  description: "text-muted-foreground",
                },
              }}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
