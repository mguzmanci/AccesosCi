export default function Loading() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="space-y-2">
            <div className="h-5 w-48 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-6 py-8">
        <div className="flex gap-2 border-b border-border pb-2">
          <div className="h-8 w-28 animate-pulse rounded bg-muted" />
          <div className="h-8 w-28 animate-pulse rounded bg-muted" />
          <div className="h-8 w-28 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-3">
          <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
        </div>
      </main>
    </div>
  );
}
