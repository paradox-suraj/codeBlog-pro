export default function ArticleLoading() {
  return (
    <article className="container max-w-4xl px-4 py-10 md:px-6 md:py-16 animate-pulse">
      <div className="space-y-4 text-center">
        <div className="h-4 w-32 mx-auto rounded-full bg-muted" />
        <div className="h-12 w-3/4 mx-auto rounded-xl bg-muted" />
        <div className="flex items-center justify-center gap-4 pt-4">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-3 w-32 rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="mt-8 aspect-video w-full rounded-2xl bg-muted" />
      <div className="mt-12 space-y-6">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
    </article>
  );
}
