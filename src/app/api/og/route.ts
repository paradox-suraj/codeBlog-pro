import { NextResponse } from "next/server";

export async function GET() {
  const siteName = escapeXml(process.env.NEXT_PUBLIC_SITE_NAME ?? "CodeBlog Pro");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${siteName}">
  <rect width="1200" height="630" fill="#102027"/>
  <path d="M0 545h1200v85H0z" fill="#14333a"/>
  <path d="M88 88h1024v454H88z" fill="#f7f4ee" opacity="0.05"/>
  <rect x="88" y="88" width="64" height="64" rx="14" fill="#22c7c7"/>
  <text x="120" y="130" text-anchor="middle" fill="#102027" font-family="Arial, sans-serif" font-size="34" font-weight="900">C</text>
  <text x="176" y="130" fill="#f6f1e8" font-family="Arial, sans-serif" font-size="34" font-weight="800">${siteName}</text>
  <text x="88" y="306" fill="#f6f1e8" font-family="Arial, sans-serif" font-size="76" font-weight="900">Developer writing</text>
  <text x="88" y="392" fill="#f6f1e8" font-family="Arial, sans-serif" font-size="76" font-weight="900">with depth and context.</text>
  <text x="88" y="470" fill="#c8d3d7" font-family="Arial, sans-serif" font-size="28">Insights, tutorials, and engineering stories for builders.</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
