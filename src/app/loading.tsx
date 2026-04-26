export default function LoadingPage() {
  return (
    <main className="min-h-screen bg-taupe-100 px-6 py-10">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-[1.75rem] bg-white/55 ring-1 ring-taupe-950/10"
          />
        ))}
      </div>
    </main>
  );
}
