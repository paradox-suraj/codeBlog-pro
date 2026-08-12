import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET() {
  const posts = await db.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      author: { select: { name: true, email: true } },
    }
  });

  const rssItems = posts.map(post => {
    const pubDate = new Date(post.createdAt).toUTCString();
    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${APP_URL}/blog/${post.slug}</link>
      <guid>${APP_URL}/blog/${post.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      ${post.author?.name ? `<author>${post.author.email || 'author@codeblog.pro'} (${post.author.name})</author>` : ''}
    </item>`;
  }).join('');

  const feed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CodeBlog Pro</title>
    <link>${APP_URL}</link>
    <description>A premium publishing platform</description>
    <atom:link href="${APP_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(feed, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
