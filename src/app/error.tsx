"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-taupe-100 px-6">
      <section className="w-full max-w-md rounded-[1.75rem] bg-white/70 p-6 ring-1 ring-taupe-950/10">
        <p className="text-sm/6 font-medium text-taupe-500">Error</p>
        <h1 className="mt-2 text-2xl/8 font-semibold tracking-tight text-taupe-950">
          Catalog unavailable
        </h1>
        <p className="mt-2 line-clamp-2 text-sm/6 text-taupe-600">
          {error.message || "An unexpected error interrupted this view."}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-5 rounded-full bg-taupe-950 px-4 py-2 text-sm/6 font-medium text-white"
        >
          Retry
        </button>
      </section>
    </main>
  );
}
