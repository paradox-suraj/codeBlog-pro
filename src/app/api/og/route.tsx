import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Dynamic params
    const hasTitle = searchParams.has('title');
    const title = hasTitle ? searchParams.get('title')?.slice(0, 100) : 'CodeBlog Pro';
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: '#fdfaf6', // var(--background)
            padding: '80px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ffffff',
              borderRadius: '40px',
              padding: '60px',
              border: '4px solid #e2e8f0', // var(--border)
              boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
              width: '100%',
              height: '100%',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: '#ff6b4a', // Brand color
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                }}
              >
                CodeBlog Pro
              </span>
              <h1
                style={{
                  fontSize: 64,
                  fontWeight: 800,
                  color: '#0f172a', // text-slate-900
                  lineHeight: 1.1,
                  margin: 0,
                  maxWidth: '900px',
                }}
              >
                {title}
              </h1>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: '#64748b', // text-slate-500
                }}
              >
                Read the full article at codeblog.pro
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
