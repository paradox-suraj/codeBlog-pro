import Link from "next/link";
import { Search } from "lucide-react";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background py-16 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          
          {/* Left Column: Text & Search */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl/none text-foreground">
                Discover the best <br />
                <span className="text-primary">engineering</span> insights.
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                CodeBlog Pro is the production-ready publishing platform for developers. 
                Learn from industry experts, explore modern architectures, and build better software.
              </p>
            </div>
            
            <div className="w-full max-w-lg">
              <form className="relative flex items-center w-full" action="/blog">
                <Search className="absolute left-6 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search articles, topics, or authors..."
                  className="w-full rounded-full border-2 border-border bg-card py-4 pl-14 pr-32 text-base outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <p>Popular topics:</p>
              <div className="flex gap-2">
                <Link href="/category/react" className="hover:text-primary hover:underline">React</Link>
                <Link href="/category/nodejs" className="hover:text-primary hover:underline">Node.js</Link>
                <Link href="/category/architecture" className="hover:text-primary hover:underline">Architecture</Link>
              </div>
            </div>
          </div>

          {/* Right Column: Masked Image */}
          <div className="mx-auto w-full max-w-[500px] lg:max-w-none flex justify-center lg:justify-end relative">
            <div className="relative w-full aspect-[4/5] sm:w-[400px] lg:w-[480px]">
              {/* Decorative background blob/shape */}
              <div className="absolute -inset-4 bg-secondary rounded-[100px] rotate-[-6deg] opacity-70" />
              
              {/* Arch masked image */}
              <div className="relative w-full h-full overflow-hidden shadow-soft" style={{ borderRadius: '240px 240px 16px 16px' }}>
                <Image
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072&ixlib=rb-4.0.3"
                  alt="Developer working"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
              
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 rounded-2xl bg-card p-4 shadow-lift border border-border flex items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="h-10 w-10 rounded-full border-2 border-card bg-primary/20"></div>
                  <div className="h-10 w-10 rounded-full border-2 border-card bg-secondary"></div>
                  <div className="h-10 w-10 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-bold">+1k</div>
                </div>
                <p className="text-sm font-semibold leading-tight">Join our<br/>community</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
