import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="card-surface mx-auto my-20 max-w-2xl space-y-4 p-8">
      <p className="eyebrow">Not found</p>
      <h1 className="font-display text-4xl text-[var(--ink-strong)]">
        That strategy record is not in the current corpus.
      </h1>
      <p className="text-sm leading-7 text-[var(--ink-soft)]">
        The route may point at a goal or agency that has not been extracted yet, or the
        identifier is invalid.
      </p>
      <Link href="/explore" className="button-primary">
        Return to explore
      </Link>
    </div>
  );
}
