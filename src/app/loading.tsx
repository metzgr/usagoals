export default function LoadingPage() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="card-surface h-48 animate-pulse bg-[linear-gradient(120deg,rgba(255,255,255,0.55),rgba(219,230,239,0.95),rgba(255,255,255,0.55))] p-6"
        />
      ))}
    </div>
  );
}
