"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, LandPlot, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

type Product = {
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
  bullets: string[];
};

const PRODUCTS: Product[] = [
  {
    icon: LandPlot,
    tag: "Под застройку",
    title: "Коммерческая земля с предварительным договором аренды",
    description:
      "Участок под коммерческую застройку с уже согласованным предварительным договором аренды от федеральной сети. Понятная экономика и прогнозируемый выход на арендный поток.",
    bullets: [
      "Предварительный договор аренды с федеральной сетью",
      "Прозрачная экономика и расчёт доходности",
      "Понятный горизонт выхода на арендный поток",
      "Юридическое сопровождение сделки",
    ],
  },
  {
    icon: Store,
    tag: "Под ключ",
    title: "Готовый арендный бизнес (ГАБ)",
    description:
      "Объект уже сдан федеральному арендатору и генерирует арендный доход с первого дня. Инвестиция «под ключ» без операционной рутины.",
    bullets: [
      "Доход с первого дня владения",
      "Надёжный федеральный арендатор",
      "Долгосрочный договор аренды",
      "Без операционной нагрузки на собственника",
    ],
  },
];

export function Products() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="products" className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Наши продукты"
          title="Что мы предлагаем"
          description="Два формата входа в коммерческую недвижимость с федеральными арендаторами — выберите подходящий под вашу стратегию."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {PRODUCTS.map((product, index) => (
            <motion.article
              key={product.title}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface/70 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow sm:p-9"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
              />

              <div className="flex items-center justify-between">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-background/60 text-accent transition-colors group-hover:border-accent/40">
                  <product.icon size={26} />
                </span>
                <span className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs font-medium text-gold">
                  {product.tag}
                </span>
              </div>

              <h3 className="mt-6 font-display text-2xl font-bold tracking-tight">
                {product.title}
              </h3>
              <p className="body-lg mt-3 text-[15px]">{product.description}</p>

              <ul className="mt-6 space-y-3 border-t border-border pt-6">
                {product.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                      <Check size={13} />
                    </span>
                    <span className="text-foreground/90">{bullet}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contacts"
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
              >
                Запросить подборку
                <ArrowUpRight size={16} />
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
