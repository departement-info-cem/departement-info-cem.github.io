"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Fait apparaître doucement son contenu quand il entre dans l'écran (remplace rellax).
export function Apparition({ children, className, delai = 0 }: { children: React.ReactNode; className?: string; delai?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("visible");
          obs.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -5% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn("apparition", className)} style={{ transitionDelay: `${delai}ms` }}>
      {children}
    </div>
  );
}
