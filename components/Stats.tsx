"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";

// TODO: заменить на реальные данные
type Stat = {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
};

const STATS: Stat[] = [
  { value: 50, suffix: "+", label: "Объектов в работе" },
  { value: 20, suffix: "+", label: "Федеральных арендаторов-партнёров" },
  { value: 8, label: "Лет на рынке" },
  { value: 15, suffix: "%", label: "Средняя доходность" },
];

function Counter({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;

    if (reduceMotion) {
      setDisplay(stat.value);
      return;
    }

    const controls = animate(0, stat.value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(latest),
    });

    return () => controls.stop();
  }, [inView, reduceMotion, stat.value]);

  const formatted = display.toLocaleString("ru-RU", {
    minimumFractionDigits: stat.decimals ?? 0,
    maximumFractionDigits: stat.decimals ?? 0,
  });

  return (
    <span ref={ref} className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
      {stat.prefix}
      {formatted}
      {stat.suffix}
    </span>
  );
}

export function Stats() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-12 sm:py-16">
      <div className="container-page">
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border lg:grid-cols-4"
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center gap-2 bg-surface/80 px-4 py-10 text-center"
            >
              <span className="text-accent">
                <Counter stat={stat} />
              </span>
              <span className="text-sm text-muted">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
