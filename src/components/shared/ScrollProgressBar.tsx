import React, { useEffect, useRef } from "react";

export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;

    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        if (barRef.current) barRef.current.style.width = "0%";
        return;
      }
      const percent = Math.min((scrollTop / docHeight) * 100, 100);
      if (barRef.current) {
        barRef.current.style.width = `${percent}%`;
      }
    }

    function onScroll() {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateProgress);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className="scroll-progress-track"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div ref={barRef} className="scroll-progress-bar" style={{ width: "0%" }} />
    </div>
  );
}
