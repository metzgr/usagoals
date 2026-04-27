import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-[calc(100dvh-var(--site-banner-height))] place-items-center bg-[#18181b] px-6 text-white">
      <section className="w-full max-w-md rounded-[1.75rem] bg-[#27272a] p-6 ring-1 ring-white/10">
        <p className="text-sm/6 font-medium text-[#a8afb7]">404</p>
        <h1 className="mt-2 text-2xl/8 font-semibold tracking-tight text-white">
          Not found
        </h1>
        <Link
          href="/"
          className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm/6 font-medium text-[#18181b]"
        >
          Browse catalog
        </Link>
      </section>
    </main>
  );
}
