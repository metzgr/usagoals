"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const maxFontSize = 40;
const minFontSize = 6;
const lineHeightRatio = 42 / 40;
const maxLines = 3;

export function AutoFitClampedTitle({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const measuringRef = useRef<HTMLHeadingElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useEffect(() => {
    const titleElement = titleRef.current;
    const measuringElement = measuringRef.current;
    const wrapperElement = wrapperRef.current;

    if (!titleElement || !measuringElement || !wrapperElement) {
      return;
    }

    const title: HTMLHeadingElement = titleElement;
    const measuringTitle: HTMLHeadingElement = measuringElement;
    const wrapper: HTMLDivElement = wrapperElement;

    let animationFrame = 0;
    let cancelled = false;

    function getLineHeight(size: number) {
      return size * lineHeightRatio;
    }

    function applySize(target: HTMLHeadingElement, size: number) {
      target.style.fontSize = `${size}px`;
      target.style.lineHeight = `${getLineHeight(size)}px`;
    }

    function fits(size: number) {
      measuringTitle.style.width = `${title.clientWidth}px`;
      applySize(measuringTitle, size);
      return measuringTitle.scrollHeight <= getLineHeight(size) * maxLines + 1;
    }

    function measure() {
      if (cancelled) {
        return;
      }

      if (fits(maxFontSize)) {
        setFontSize(maxFontSize);
        return;
      }

      if (!fits(minFontSize)) {
        setFontSize(minFontSize);
        return;
      }

      let lower = minFontSize;
      let upper = maxFontSize;

      for (let index = 0; index < 8; index += 1) {
        const midpoint = (lower + upper) / 2;

        if (fits(midpoint)) {
          lower = midpoint;
        } else {
          upper = midpoint;
        }
      }

      setFontSize(Math.floor(lower * 10) / 10);
    }

    function scheduleMeasure() {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(measure);
    }

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(wrapper);
    scheduleMeasure();

    void document.fonts?.ready.then(scheduleMeasure);

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [children]);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-full">
      <h2
        ref={titleRef}
        className={cn(
          "line-clamp-3 max-w-full font-card-title font-normal uppercase tracking-normal text-white",
          className,
        )}
        style={{
          fontSize,
          lineHeight: `${fontSize * lineHeightRatio}px`,
        }}
      >
        {children}
      </h2>
      <h2
        ref={measuringRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none invisible absolute left-0 top-0 max-w-full font-card-title font-normal uppercase tracking-normal",
          className,
        )}
        style={{
          fontSize,
          lineHeight: `${fontSize * lineHeightRatio}px`,
        }}
      >
        {children}
      </h2>
    </div>
  );
}
