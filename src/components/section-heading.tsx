type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-3xl space-y-3">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="font-display text-4xl leading-none tracking-tight text-[var(--ink-strong)] sm:text-5xl">
        {title}
      </h2>
      <p className="text-base leading-8 text-[var(--ink-soft)] sm:text-lg">
        {description}
      </p>
    </div>
  );
}
