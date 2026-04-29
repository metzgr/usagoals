"use client";

import { useEffect, useRef, useState } from "react";

export function CatalogGoalSummaryPreview({ summary }: { summary: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [lineCount, setLineCount] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;

    if (!container || !text) {
      return;
    }

    const containerElement: HTMLDivElement = container;
    const textElement: HTMLParagraphElement = text;
    let animationFrame = 0;
    let cancelled = false;

    function measure() {
      if (cancelled) {
        return;
      }

      const lineHeight = Number.parseFloat(getComputedStyle(textElement).lineHeight);
      const containerStyle = getComputedStyle(containerElement);
      const availableHeight =
        containerElement.clientHeight -
        Number.parseFloat(containerStyle.paddingTop) -
        Number.parseFloat(containerStyle.paddingBottom);
      const nextLineCount = Math.max(1, Math.floor(availableHeight / lineHeight));

      setLineCount(nextLineCount);
    }

    function scheduleMeasure() {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(measure);
    }

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(containerElement);
    scheduleMeasure();

    void document.fonts?.ready.then(scheduleMeasure);

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [summary]);

  return (
    <div
      ref={containerRef}
      data-component="GoalSummaryPreview"
      className="flex min-h-0 w-full flex-1 items-start overflow-hidden p-6 max-[640px]:p-5 pt-0"
    >
      <p
        ref={textRef}
        className="overflow-hidden text-sm leading-[22px] text-[#a8afb7] [display:-webkit-box] [-webkit-box-orient:vertical]"
        style={{
          WebkitLineClamp: lineCount ?? undefined,
        }}
      >
        {summary}
      </p>
    </div>
  );
}
