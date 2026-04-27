"use client";

import { useLayoutEffect, useRef } from "react";

const MAX_TITLE_SIZE = 44;
const MIN_TITLE_SIZE = 11;
const FIT_TOLERANCE = 1;

export function AutoFitGoalTitle({ title }: { title: string }) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const element = titleRef.current;

    if (!element) {
      return;
    }

    const titleElement = element;
    let active = true;
    let animationFrame = 0;

    function textFits() {
      return (
        titleElement.scrollHeight <= titleElement.clientHeight + FIT_TOLERANCE &&
        titleElement.scrollWidth <= titleElement.clientWidth + FIT_TOLERANCE
      );
    }

    function setTitleSize(size: number) {
      titleElement.style.fontSize = `${size}px`;
    }

    function fitTitle() {
      setTitleSize(MAX_TITLE_SIZE);

      if (textFits()) {
        return;
      }

      let low = MIN_TITLE_SIZE;
      let high = MAX_TITLE_SIZE;

      for (let step = 0; step < 9; step += 1) {
        const midpoint = (low + high) / 2;
        setTitleSize(midpoint);

        if (textFits()) {
          low = midpoint;
        } else {
          high = midpoint;
        }
      }

      setTitleSize(Math.floor(low));
    }

    function scheduleFit() {
      if (!active) {
        return;
      }

      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(fitTitle);
    }

    const resizeObserver = new ResizeObserver(scheduleFit);
    resizeObserver.observe(titleElement);
    document.fonts.ready.then(scheduleFit);
    scheduleFit();

    return () => {
      active = false;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [title]);

  return (
    <h2
      ref={titleRef}
      className="h-full w-full overflow-hidden font-serif text-[44px] font-normal uppercase leading-[1.04] tracking-normal text-white [overflow-wrap:anywhere] [text-wrap:balance]"
    >
      {title}
    </h2>
  );
}
