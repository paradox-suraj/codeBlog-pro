export default function LoadingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative w-full overflow-hidden bg-background py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            
            {/* Left Column */}
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <div className="h-14 md:h-20 w-3/4 rounded-2xl bg-muted animate-pulse" />
                <div className="h-20 w-full max-w-[600px] rounded-2xl bg-muted animate-pulse" />
              </div>
              
              {/* Search input skeleton */}
              <div className="w-full max-w-lg h-16 rounded-full bg-muted animate-pulse" />
              
              {/* Topics skeleton */}
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
                <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
                <div className="h-6 w-24 rounded-full bg-muted animate-pulse" />
              </div>
            </div>

            {/* Right Column (Arch Image Skeleton) */}
            <div className="mx-auto w-full max-w-[500px] lg:max-w-none flex justify-center lg:justify-end relative">
              <div className="relative w-full aspect-[4/5] sm:w-[400px] lg:w-[480px]">
                <div 
                  className="w-full h-full bg-muted animate-pulse"
                  style={{ borderRadius: '240px 240px 16px 16px' }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Category Scroller Skeleton */}
      <div className="w-full py-12 bg-card border-y border-border overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="h-8 w-48 rounded-xl bg-muted animate-pulse mb-8" />
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-none w-48 h-48 rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Articles Skeleton */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="h-10 w-64 rounded-xl bg-muted animate-pulse mb-10" />
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-3xl bg-card border border-border">
                <div className="aspect-[16/10] w-full bg-muted animate-pulse" />
                <div className="flex flex-col p-6 space-y-4">
                  <div className="h-4 w-24 rounded-full bg-muted animate-pulse" />
                  <div className="h-8 w-full rounded-xl bg-muted animate-pulse" />
                  <div className="h-16 w-full rounded-xl bg-muted animate-pulse" />
                  <div className="h-10 w-32 rounded-full bg-muted animate-pulse mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
