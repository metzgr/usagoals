"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="grid min-h-[calc(100dvh-var(--site-banner-height))] place-items-center bg-[#18181b] px-6 text-white">
      <section className="w-full max-w-md rounded-[1.75rem] bg-[#27272a] p-6 ring-1 ring-white/10">
        <p className="text-sm/6 font-medium text-[#a8afb7]">Error</p>
        <h1 className="mt-2 text-2xl/8 font-semibold tracking-tight text-white">
          Catalog unavailable
        </h1>
        <p className="mt-2 line-clamp-2 text-sm/6 text-[#a8afb7]">
          {error.message || "An unexpected error interrupted this view."}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-5 rounded-full bg-white px-4 py-2 text-sm/6 font-medium text-[#18181b]"
        >
          Retry
        </button>
      </section>
    </main>
  );
}
