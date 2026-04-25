"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="card-surface mx-auto my-20 max-w-2xl space-y-4 p-8">
      <p className="eyebrow">Application Error</p>
      <h2 className="font-display text-4xl text-[var(--ink-strong)]">
        The current corpus request failed.
      </h2>
      <p className="text-sm leading-7 text-[var(--ink-soft)]">
        {error.message || "An unexpected error interrupted this view."}
      </p>
      <button type="button" onClick={() => reset()} className="button-primary">
        Try again
      </button>
    </div>
  );
}
