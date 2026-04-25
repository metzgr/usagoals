import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
};

export function MetricCard({ label, value, detail, icon }: MetricCardProps) {
  return (
    <article className="card-surface flex h-full flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="eyebrow">{label}</p>
        <div className="rounded-full bg-[var(--mist)] p-2 text-[var(--ink-strong)]">
          {icon}
        </div>
      </div>
      <p className="text-4xl font-semibold tracking-tight text-[var(--ink-strong)]">
        {value}
      </p>
      <p className="text-sm leading-6 text-[var(--ink-soft)]">{detail}</p>
    </article>
  );
}
