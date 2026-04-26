import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-taupe-100 px-6">
      <section className="w-full max-w-md rounded-[1.75rem] bg-white/70 p-6 ring-1 ring-taupe-950/10">
        <p className="text-sm/6 font-medium text-taupe-500">404</p>
        <h1 className="mt-2 text-2xl/8 font-semibold tracking-tight text-taupe-950">
          Not found
        </h1>
        <Link
          href="/"
          className="mt-5 inline-flex rounded-full bg-taupe-950 px-4 py-2 text-sm/6 font-medium text-white"
        >
          Browse catalog
        </Link>
      </section>
    </main>
  );
}
