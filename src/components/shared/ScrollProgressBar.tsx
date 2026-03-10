import React, { useEffect, useState } from "react";

export function ScrollProgressBar() {
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setScrollPercent(0);
        return;
      }
      const percent = Math.min((scrollTop / docHeight) * 100, 100);
      setScrollPercent(percent);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="scroll-progress-track"
      role="progressbar"
      aria-valuenow={Math.round(scrollPercent)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="scroll-progress-bar"
        style={{ width: `${scrollPercent}%` }}
      />
    </div>
  );
}
