"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck, Building2, Handshake, Sparkles } from "lucide-react";

const TRUST_POINTS = [
  { icon: Building2, label: "Федеральные арендаторы" },
  { icon: ShieldCheck, label: "Юридическая чистота" },
  { icon: Handshake, label: "Сопровождение под ключ" },
] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12, delayChildren: 0.05 },
    },
  };

  const item = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      id="top"
      className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-28"
    >
      {/* Радиальное emerald-свечение за заголовком */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[680px] w-[680px] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(47,174,102,0.22) 0%, rgba(47,174,102,0) 65%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-60" />

      <motion.div
        className="container-page flex flex-col items-center text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.span variants={item} className="eyebrow">
          <Sparkles size={14} className="text-accent" />
          Коммерческая недвижимость с федеральными арендаторами
        </motion.span>

        <motion.h1
          variants={item}
          className="heading-xl mt-6 max-w-4xl text-balance"
        >
          Инвестиции в коммерческую недвижимость со{" "}
          <span className="text-accent">стабильным арендным доходом</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="body-lg mt-6 max-w-2xl text-base sm:text-lg"
        >
          SHELBIT — продажа коммерческой земли с предварительным договором аренды
          от федеральной сети и готового арендного бизнеса с надёжным федеральным
          арендатором.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
        >
          <a
            href="#contacts"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-background shadow-soft transition-all hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-glow sm:w-auto"
          >
            Получить подборку объектов
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </a>
          <a
            href="#products"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface/40 px-6 py-3.5 text-base font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-surface sm:w-auto"
          >
            Узнать подробнее
          </a>
        </motion.div>

        <motion.ul
          variants={item}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
        >
          {TRUST_POINTS.map((point) => (
            <li
              key={point.label}
              className="inline-flex items-center gap-2.5 text-sm text-muted"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface/60 text-accent">
                <point.icon size={16} />
              </span>
              {point.label}
            </li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
}
