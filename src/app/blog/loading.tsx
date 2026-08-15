export default function BlogListLoading() {
  return (
    <div className="container px-4 py-12 md:px-6 animate-pulse">
      <div className="flex flex-col items-center mb-12 space-y-4">
        <div className="h-10 w-64 rounded-xl bg-muted" />
        <div className="h-4 w-96 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-3xl bg-card border border-border">
            <div className="aspect-[16/10] w-full bg-muted" />
            <div className="flex flex-col p-6 space-y-4">
              <div className="h-4 w-24 rounded-full bg-muted" />
              <div className="h-8 w-full rounded-xl bg-muted" />
              <div className="h-16 w-full rounded-xl bg-muted" />
              <div className="h-10 w-32 rounded-full bg-muted mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
