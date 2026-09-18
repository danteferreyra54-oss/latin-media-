"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NAV_ITEMS } from "@/lib/nav";

/** Umbral en px antes de empezar a esconder: evita que tiemble cerca del top. */
const UMBRAL = 60;

export default function StickyNav() {
  const [oculto, setOculto] = useState(false);
  const ultimoScrollY = useRef(0);

  useEffect(() => {
    ultimoScrollY.current = window.scrollY;
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const y = window.scrollY;
        const bajando = y > ultimoScrollY.current;

        setOculto(bajando && y > UMBRAL);

        ultimoScrollY.current = y;
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav${oculto ? " nav--oculto" : ""}`}>
      <div className="wrap">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={item.hot ? "hot" : undefined}>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
